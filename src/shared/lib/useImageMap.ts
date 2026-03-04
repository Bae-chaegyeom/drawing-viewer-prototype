import { useEffect, useState } from 'react';

export function useImageMap(files: string[]) {
  const [map, setMap] = useState<Record<string, HTMLImageElement>>({});

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const next: Record<string, HTMLImageElement> = {};
      await Promise.all(
        files.map(
          (f) =>
            new Promise<void>((resolve) => {
              const img = new window.Image();
              img.src = `/data/drawings/${encodeURIComponent(f)}`;
              img.onload = () => {
                next[f] = img;
                resolve();
              };
              img.onerror = () => resolve();
            }),
        ),
      );
      if (!cancelled) setMap(next);
    })();

    return () => {
      cancelled = true;
    };
  }, [files.join('|')]);

  return map;
}
