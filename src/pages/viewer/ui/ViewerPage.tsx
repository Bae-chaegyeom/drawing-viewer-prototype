import { useEffect, useMemo, useState } from 'react';
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
        disciplineId: '건축',
        regionKey,
        revVersion: 'REV1',
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

    // 1) selectedLayer에 polygon이 있으면 그걸 사용 (09 건축 같은 케이스)
    if (selectedLayer?.polygon) return selectedLayer.polygon;

    // 2) 없으면 disciplineBase polygon fallback (01 건축 등)
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

  return (
    <div className="h-dvh bg-slate-100 flex flex-col">
      <MobileHeader title={breadcrumb} subtitle={subtitle} />

      <div className="flex-1 overflow-hidden pb-[260px]">
        <MobileViewerCard imageFile={selectedLayer?.image} polygon={polygonSource} />
      </div>

      <ChangeSheet
        items={items}
        onMove={(id) => {
          console.log('move to', id);
          // Commit 9-3에서 polygon focus 기능 연결
        }}
      />
    </div>
  );
}
