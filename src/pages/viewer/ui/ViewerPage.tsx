import { useEffect, useMemo, useState } from 'react';
import { loadMetadata } from '@/entities/metadata/lib/loadMetadata';
import { buildRenderLayers } from '@/entities/metadata/lib/buildRenderLayers';
import { buildNavigationIndex } from '@/entities/metadata/lib/buildNavigationIndex';

export function ViewerPage() {
  const [meta, setMeta] = useState<any>(null);
  const [layers, setLayers] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const m = await loadMetadata();
        const ls = buildRenderLayers(m);

        if (!mounted) return;
        setMeta(m);
        setLayers(ls);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message ?? 'unknown error');
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const debug = useMemo(() => {
    if (!meta) return null;

    const drawingCount = Object.keys(meta.drawings ?? {}).length;
    const layerCount = layers.length;

    const sample = layers.slice(0, 12);

    const byKind: Record<string, number> = {};
    for (const l of layers) byKind[l.kind] = (byKind[l.kind] ?? 0) + 1;

    return {
      summary: { drawingCount, layerCount, byKind },
      sampleLayers: sample,
    };
  }, [meta, layers]);

  if (error) return <div style={{ padding: 16 }}>Error: {error}</div>;
  if (!debug) return <div style={{ padding: 16 }}>Loading metadata…</div>;

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Commit 6 Debug View</h1>

      <p style={{ marginBottom: 12 }}>metadata 로드 + render layers 정규화 결과 요약</p>

      <pre
        style={{
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          background: '#111',
          color: '#eee',
          padding: 12,
          borderRadius: 8,
          fontSize: 12,
          lineHeight: 1.4,
        }}
      >
        {JSON.stringify(debug, null, 2)}
      </pre>
    </div>
  );
}
