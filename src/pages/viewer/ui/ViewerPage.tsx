import { useEffect, useMemo, useState, useRef } from 'react';
import { loadMetadata } from '@/entities/metadata/lib/loadMetadata';
import {
  buildNavigationIndex,
  type NavigationIndex,
} from '@/entities/metadata/lib/buildNavigationIndex';
import { buildRenderLayers } from '@/entities/metadata/lib/buildRenderLayers';
import type { RenderLayer } from '@/entities/metadata/model/renderTypes';

import { MobileHeader } from '@/widgets/mobile-header/ui/MobileHeader';
import { MobileViewerCard } from '@/widgets/drawing-viewer/ui/MobileViewerCard';
import { ChangeSheet } from '@/widgets/change-sheet/ui/ChangeSheet';
import type { MobileViewerHandle } from '@/widgets/drawing-viewer/ui/MobileViewerCard';
import { DesktopLayout } from '@/widgets/desktop-layout/ui/DesktopLayout';
import { OverlayControls } from '@/widgets/overlay-controls/ui/OverlayControls';
import { DesktopInspector } from '@/widgets/desktop-inspector/ui/DesktopInspector';
import { useImageMap } from '@/shared/lib/useImageMap';
import { DesktopDrawingViewer } from '@/widgets/drawing-viewer/ui/DesktopDrawingViewer';

type ChangeItem = { id: string; title: string; subtitle?: string };

type Selection = {
  drawingId: string;
  disciplineId: string;
  regionKey?: string;
  revVersion?: string;
};

export function ViewerPage() {
  const [breadcrumb, setBreadcrumb] = useState('Loading...');
  const [subtitle, setSubtitle] = useState<string | undefined>(undefined);
  const [items, setItems] = useState<ChangeItem[]>([]);

  const [nav, setNav] = useState<NavigationIndex | null>(null);
  const [layers, setLayers] = useState<RenderLayer[]>([]);
  const [selection, setSelection] = useState<Selection | null>(null);
  const viewerRef = useRef<MobileViewerHandle>(null);

  const [baseDiscipline, setBaseDiscipline] = useState<string>('건축');
  const [overlayEnabled, setOverlayEnabled] = useState<Record<string, boolean>>({
    구조: true,
    설비: false,
    소방: false,
    공조설비: false,
    배관설비: false,
  });
  const [opacityByDiscipline, setOpacityByDiscipline] = useState<Record<string, number>>({
    건축: 1,
    구조: 0.8,
    설비: 0.6,
    소방: 0.4,
    공조설비: 0.6,
    배관설비: 0.6,
  });

  useEffect(() => {
    let mounted = true;

    (async () => {
      const meta = await loadMetadata();
      const navIndex = buildNavigationIndex(meta);
      const renderLayers = buildRenderLayers(meta);

      const firstDrawing = navIndex.drawings.find((d) => d.id !== '00') ?? navIndex.drawings[0];
      const firstDiscipline = firstDrawing.disciplines[0];
      const firstNavRev =
        firstDiscipline.regions?.[0]?.revisions?.[0] ?? firstDiscipline.revisions?.[0];

      const revVersion = firstNavRev?.version;
      const regionKey = firstDiscipline.regions?.[0]?.key;

      const bc = `${firstDrawing.name} > ${firstDiscipline.id}${revVersion ? ` > ${revVersion}` : ''}`;
      const sub = firstNavRev?.date ? `마지막 업데이트: ${firstNavRev.date}` : undefined;

      if (!mounted) return;
      setNav(navIndex);
      setLayers(renderLayers);
      setSelection({
        drawingId: '01',
        disciplineId: '구조',
        regionKey: 'A',
        revVersion: 'REV2A',
      });
      setBreadcrumb(bc);
      setSubtitle(sub);
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const selectedLayer = useMemo(() => {
    if (!selection) return undefined;

    return layers.find((l) => {
      if (l.drawingId !== selection.drawingId) return false;
      if (l.disciplineId !== selection.disciplineId) return false;
      if (selection.revVersion && l.revisionVersion !== selection.revVersion) return false;
      if (selection.regionKey && l.regionKey !== selection.regionKey) return false;
      return true;
    });
  }, [layers, selection]);

  const polygonSource = useMemo(() => {
    if (!selection) return undefined;

    if (selectedLayer?.polygon) return selectedLayer.polygon;

    if (selectedLayer?.kind === 'regionRevision' && selection.regionKey) {
      return layers.find(
        (l) =>
          l.kind === 'regionBase' &&
          l.drawingId === selection.drawingId &&
          l.disciplineId === selection.disciplineId &&
          l.regionKey === selection.regionKey,
      )?.polygon;
    }

    return layers.find(
      (l) =>
        l.kind === 'disciplineBase' &&
        l.drawingId === selection.drawingId &&
        l.disciplineId === selection.disciplineId,
    )?.polygon;
  }, [layers, selection, selectedLayer]);

  useEffect(() => {
    if (!selectedLayer) {
      setItems([]);
      return;
    }

    const next: ChangeItem[] = (selectedLayer.changes ?? [])
      .slice(0, 5)
      .map((c: string, idx: number) => ({
        id: `C-${String(idx + 1).padStart(2, '0')}`,
        title: c,
      }));

    setItems(next);
  }, [selectedLayer]);

  const viewerImageFile = useMemo(() => {
    if (!selectedLayer) return undefined;

    if (selectedLayer.kind === 'regionRevision') return selectedLayer.alignToImage;
    return selectedLayer.image;
  }, [selectedLayer]);

  const availableDisciplines = useMemo(() => {
    if (!selection) return [];
    const set = new Set<string>();
    for (const l of layers) {
      if (l.drawingId === selection.drawingId && l.disciplineId) {
        set.add(l.disciplineId);
      }
    }
    return Array.from(set);
  }, [layers, selection]);

  const overlayAvailable = useMemo(() => {
    if (!selection) return {};

    const map: Record<string, boolean> = {};

    for (const d of availableDisciplines) {
      const found = layers.find(
        (l) =>
          l.kind === 'disciplineBase' &&
          l.drawingId === selection.drawingId &&
          l.disciplineId === d &&
          !!l.image,
      );
      map[d] = !!found;
    }

    return map;
  }, [layers, selection, availableDisciplines]);

  useEffect(() => {
    if (!selection) return;

    setOverlayEnabled((prev) => {
      let changed = false;
      const next: Record<string, boolean> = { ...prev };

      for (const d of Object.keys(next)) {
        if (d === baseDiscipline) continue;

        const available = overlayAvailable[d] ?? false;

        if (!available && next[d]) {
          next[d] = false;
          changed = true;
        }
      }

      return changed ? next : prev;
    });
  }, [overlayAvailable, selection, baseDiscipline]);

  const baseLayer = useMemo(() => {
    if (!selection) return undefined;
    return layers.find(
      (l) =>
        l.kind === 'disciplineBase' &&
        l.drawingId === selection.drawingId &&
        l.disciplineId === baseDiscipline,
    );
  }, [layers, selection, baseDiscipline]);

  const overlayLayers = useMemo(() => {
    if (!selection) return [];

    return Object.keys(overlayEnabled)
      .filter((k) => overlayEnabled[k])
      .map((k) => {
        const found = layers.find(
          (l) =>
            l.kind === 'disciplineBase' &&
            l.drawingId === selection.drawingId &&
            l.disciplineId === k,
        );

        return found;
      })
      .filter(Boolean);
  }, [layers, selection, overlayEnabled]);

  const viewerLayersInput = useMemo(() => {
    if (!baseLayer) return [];

    const base = {
      key: `base:${baseLayer.disciplineId}`,
      imageFile: baseLayer.image,
      opacity: 1,
      imageTransform: undefined,
    };

    const overlays = overlayLayers.map((l) => ({
      key: `ov:${l!.disciplineId}`,
      imageFile: l!.image,
      opacity: opacityByDiscipline[l!.disciplineId!] ?? 0.7,
      imageTransform: l!.imageTransform,
    }));

    return [base, ...overlays];
  }, [baseLayer, overlayLayers, opacityByDiscipline]);

  useEffect(() => {
    if (viewerLayersInput.length === 0) return;
  }, [viewerLayersInput]);

  const imageFiles = useMemo(() => viewerLayersInput.map((l) => l.imageFile), [viewerLayersInput]);
  const imageMap = useImageMap(imageFiles);

  return (
    <>
      <div className="lg:hidden h-dvh bg-slate-100 flex flex-col">
        <MobileHeader title={breadcrumb} subtitle={subtitle} />

        <div className="flex-1 overflow-hidden pb-[260px]">
          <MobileViewerCard ref={viewerRef} imageFile={viewerImageFile} polygon={polygonSource} />
        </div>

        <ChangeSheet
          items={items}
          onMove={() => {
            if (!polygonSource) return;
            viewerRef.current?.focusToPolygon(polygonSource);
          }}
        />
      </div>
      {/*데스크탑*/}
      <DesktopLayout
        left={
          <OverlayControls
            availableDisciplines={availableDisciplines}
            overlayAvailable={overlayAvailable}
            baseDiscipline={baseDiscipline}
            onChangeBase={setBaseDiscipline}
            overlayEnabled={overlayEnabled}
            onToggleOverlay={(k) => setOverlayEnabled((p) => ({ ...p, [k]: !p[k] }))}
            opacityByDiscipline={opacityByDiscipline}
            onChangeOpacity={(k, v) => setOpacityByDiscipline((p) => ({ ...p, [k]: v }))}
          />
        }
        center={
          <div className="h-full rounded-2xl bg-white shadow overflow-hidden">
            <DesktopDrawingViewer layers={viewerLayersInput} imageMap={imageMap} />
          </div>
        }
        right={
          <DesktopInspector
            breadcrumb={breadcrumb}
            subtitle={subtitle}
            discipline={selection?.disciplineId}
            revision={selection?.revVersion}
            changeItems={items}
          />
        }
      />
    </>
  );
}
