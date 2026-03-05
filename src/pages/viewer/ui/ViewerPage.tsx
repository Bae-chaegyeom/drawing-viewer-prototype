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
import { DrawingSelector } from '@/widgets/drawing-selector/ui/DrawingSelector';
import { MobileSheet } from '@/widgets/mobile-sheet/ui/MobileSheet';
import { MobileDrawingSelector } from '@/widgets/drawing-selector/ui/MobileDrawingSelector';

type ChangeItem = { id: string; title: string; subtitle?: string; movable?: boolean };

type Selection = {
  drawingId: string;
  disciplineId: string;
  regionKey?: string;
  revVersion?: string;
};

export function ViewerPage() {
  const [items, setItems] = useState<ChangeItem[]>([]);

  const [nav, setNav] = useState<NavigationIndex | null>(null);
  const [layers, setLayers] = useState<RenderLayer[]>([]);
  const [selection, setSelection] = useState<Selection | null>(null);
  const viewerRef = useRef<MobileViewerHandle>(null);
  const [viewMode, setViewMode] = useState<'revision' | 'overlay'>('revision');

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
  const [mobileNavOpen, setMobileNavOpen] = useState(true);

  useEffect(() => {
    if (!selection) return;
    setBaseDiscipline(selection.disciplineId);
  }, [selection?.disciplineId]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const meta = await loadMetadata();
      const navIndex = buildNavigationIndex(meta);
      const renderLayers = buildRenderLayers(meta);

      const firstDrawing = navIndex.drawings.find((d) => d.id !== '00') ?? navIndex.drawings[0];
      const firstDiscipline = firstDrawing.disciplines[0];

      const hasRegions = !!firstDiscipline.regions?.length;
      const regionKey = hasRegions ? firstDiscipline.regions![0].key : undefined;
      const firstRev = hasRegions
        ? firstDiscipline.regions![0].revisions[0]
        : firstDiscipline.revisions?.[0];

      if (!mounted) return;
      setNav(navIndex);
      setLayers(renderLayers);
      setSelection({
        drawingId: firstDrawing.id,
        disciplineId: firstDiscipline.id,
        regionKey,
        revVersion: firstRev?.version,
      });
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

  const breadcrumb = useMemo(() => {
    if (!nav || !selection) return 'Loading...';
    const drawingName =
      nav.drawings.find((d) => d.id === selection.drawingId)?.name ?? selection.drawingId;
    const parts = [drawingName, selection.disciplineId];
    if (selection.regionKey) parts.push(`Region ${selection.regionKey}`);
    if (selection.revVersion) parts.push(selection.revVersion);
    return parts.join(' > ');
  }, [nav, selection]);

  const subtitle = useMemo(() => {
    if (!selectedLayer?.date) return undefined;
    return `마지막 업데이트: ${selectedLayer.date}`;
  }, [selectedLayer]);

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

    const changes = selectedLayer.changes ?? [];
    let next: ChangeItem[] = [];

    if (changes.length > 0) {
      next = changes.slice(0, 5).map((c: string, idx: number) => ({
        id: `C-${String(idx + 1).padStart(2, '0')}`,
        title: c,
        movable: true,
      }));
    } else if (selectedLayer.revisionVersion) {
      next = [
        {
          id: 'INFO',
          title: selectedLayer.description ?? '변경 내역 정보 없음',
          subtitle: '이 리비전의 changes 데이터가 비어있습니다. (초기 설계일 수 있음)',
          movable: false,
        },
      ];
    }

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
          (l.kind === 'disciplineBase' || l.kind === 'disciplineRevision') &&
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

  function pickOverlayLayer(
    layers: RenderLayer[],
    drawingId: string,
    disciplineId: string,
    baseImageFile?: string,
  ) {
    const base = layers.find(
      (l) =>
        l.kind === 'disciplineBase' &&
        l.drawingId === drawingId &&
        l.disciplineId === disciplineId &&
        !!l.image,
    );
    if (base?.image && base.image !== baseImageFile) return base;

    const revs = layers
      .filter(
        (l) =>
          l.kind === 'disciplineRevision' &&
          l.drawingId === drawingId &&
          l.disciplineId === disciplineId &&
          !!l.image,
      )
      .sort((a, b) => (a.date ?? '').localeCompare(b.date ?? ''));

    const last = revs.at(-1) ?? revs[0];
    if (last?.image && last.image !== baseImageFile) return last;

    return base;
  }

  const baseImageFile = useMemo(() => {
    if (!selectedLayer) return undefined;

    return selectedLayer.alignToImage ?? selectedLayer.image;
  }, [selectedLayer]);

  const baseLayer = useMemo(() => {
    if (!selection || !baseImageFile) return undefined;

    return layers.find((l) => l.drawingId === selection.drawingId && l.image === baseImageFile);
  }, [layers, selection, baseImageFile]);

  const overlayLayers = useMemo(() => {
    if (!selection) return [];
    const baseImageFile = baseLayer?.image;

    return Object.keys(overlayEnabled)
      .filter((k) => overlayEnabled[k])
      .map((k) => pickOverlayLayer(layers, selection.drawingId, k, baseImageFile))
      .filter(Boolean);
  }, [layers, selection, overlayEnabled, baseLayer]);

  const viewerLayersInput = useMemo(() => {
    if (!selection || !selectedLayer?.image) return [];

    if (viewMode === 'revision') {
      return [
        {
          key: `single:${selectedLayer.id}`,
          imageFile: selectedLayer.image,
          opacity: 1,
          imageTransform: undefined,
        },
      ];
    }

    const base = baseLayer?.image;
    if (!base) return [];

    const overlays = overlayLayers.map((l) => ({
      key: `ov:${l!.disciplineId}`,
      imageFile: l!.image,
      opacity: opacityByDiscipline[l!.disciplineId!] ?? 0.7,
      imageTransform: l!.imageTransform,
    }));

    return [
      { key: `base:${base}`, imageFile: base, opacity: 1, imageTransform: undefined },
      ...overlays,
    ];
  }, [selection, selectedLayer, viewMode, baseLayer, overlayLayers, opacityByDiscipline]);

  const imageFiles = useMemo(() => viewerLayersInput.map((l) => l.imageFile), [viewerLayersInput]);
  const imageMap = useImageMap(imageFiles);

  return (
    <>
      <div className="lg:hidden h-dvh bg-slate-100 flex flex-col">
        <MobileHeader
          title={breadcrumb}
          subtitle={subtitle}
          onBack={() => setMobileNavOpen(true)}
          onMenu={() => setMobileNavOpen(true)}
        />

        <div className="flex-1 overflow-hidden pb-[260px]">
          <MobileViewerCard ref={viewerRef} imageFile={viewerImageFile} polygon={polygonSource} />
        </div>

        <MobileSheet open={mobileNavOpen} title="도면 선택" onClose={() => setMobileNavOpen(false)}>
          {nav && selection && (
            <MobileDrawingSelector
              drawings={nav.drawings}
              value={selection}
              onApply={(next) => {
                setSelection(next);
                setMobileNavOpen(false);
              }}
            />
          )}
        </MobileSheet>

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
          <div className="p-5 space-y-6">
            <select
              className="w-full border rounded-xl px-3 py-2"
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value as any)}
            >
              <option value="revision">리비전 보기(단독)</option>
              <option value="overlay">공종 오버레이 보기</option>
            </select>
            {nav && selection && (
              <DrawingSelector
                drawings={nav.drawings}
                value={selection}
                onChange={(next) => setSelection(next)}
              />
            )}
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
          </div>
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
