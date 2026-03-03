import { useEffect, useMemo, useState } from 'react';
import { loadMetadata } from '@/entities/metadata/lib/loadMetadata';
import { buildNavigationIndex } from '@/entities/metadata/lib/buildNavigationIndex';
import { buildRenderLayers } from '@/entities/metadata/lib/buildRenderLayers';

import { MobileHeader } from '@/widgets/mobile-header/ui/MobileHeader';
import { MobileViewerCard } from '@/widgets/drawing-viewer/ui/MobileViewerCard';
import { ChangeSheet } from '@/widgets/change-sheet/ui/ChangeSheet';

type ChangeItem = { id: string; title: string; subtitle?: string };

export function ViewerPage() {
  const [breadcrumb, setBreadcrumb] = useState<string>('Loading...');
  const [subtitle, setSubtitle] = useState<string | undefined>(undefined);
  const [items, setItems] = useState<ChangeItem[]>([]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const meta = await loadMetadata();
      const nav = buildNavigationIndex(meta);
      const layers = buildRenderLayers(meta);

      const firstDrawing = nav.drawings.find((d) => d.id !== '00') ?? nav.drawings[0];
      const firstDiscipline = firstDrawing.disciplines[0];

      const firstNavRev =
        firstDiscipline.regions?.[0]?.revisions?.[0] ?? firstDiscipline.revisions?.[0];

      const revVersion = firstNavRev?.version;

      const bc = `${firstDrawing.name} > ${firstDiscipline.id}${revVersion ? ` > ${revVersion}` : ''}`;
      const sub = firstNavRev?.date ? `마지막 업데이트: ${firstNavRev.date}` : undefined;

      // ✅ changes는 layers에서 가져오기
      const revLayer = layers.find(
        (l) =>
          l.drawingId === firstDrawing.id &&
          l.disciplineId === firstDiscipline.id &&
          l.revisionVersion === revVersion,
      );

      const changeItems: ChangeItem[] = (revLayer?.changes ?? [])
        .slice(0, 5)
        .map((c: string, idx: number) => ({
          id: `C-${String(idx + 1).padStart(2, '0')}`,
          title: c,
        }));

      if (!mounted) return;
      setBreadcrumb(bc);
      setSubtitle(sub);
      setItems(changeItems);
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="h-dvh bg-slate-100 flex flex-col">
      <MobileHeader title={breadcrumb} subtitle={subtitle} />

      <div className="flex-1 overflow-hidden">
        <MobileViewerCard />
      </div>

      <ChangeSheet
        items={items}
        onMove={(id) => {
          console.log('move to', id);
        }}
      />
    </div>
  );
}
