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

  return (
    <div className="h-dvh bg-slate-100 flex flex-col">
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
  );
}
