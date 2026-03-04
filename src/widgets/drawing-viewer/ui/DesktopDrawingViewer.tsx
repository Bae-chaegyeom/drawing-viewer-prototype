import { Stage, Layer, Image as KonvaImage, Group } from 'react-konva';
import { useEffect, useRef, useState } from 'react';

type Transform = { x: number; y: number; scale: number; rotation: number };
type ImageLayerInput = {
  key: string;
  imageFile: string;
  opacity: number;
  imageTransform?: Transform;
};

export function DesktopDrawingViewer({
  layers,
  imageMap,
}: {
  layers: ImageLayerInput[];
  imageMap: Record<string, HTMLImageElement>;
}) {
  const stageRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setSize({ width: rect.width, height: rect.height });
  }, []);

  const base = layers[0];
  const baseImg = base ? imageMap[base.imageFile] : undefined;

  useEffect(() => {
    if (!baseImg) return;
    if (size.width === 0 || size.height === 0) return;
    const fitScale = Math.min(size.width / baseImg.width, size.height / baseImg.height);
    setScale(fitScale);
  }, [baseImg, size.width, size.height]);

  const offsetX = baseImg ? (size.width / scale - baseImg.width) / 2 : 0;
  const offsetY = baseImg ? (size.height / scale - baseImg.height) / 2 : 0;

  return (
    <div ref={containerRef} className="relative h-full w-full">
      <Stage
        width={size.width}
        height={size.height}
        scaleX={scale}
        scaleY={scale}
        ref={stageRef}
        draggable
      >
        <Layer>
          {baseImg && <KonvaImage image={baseImg} x={offsetX} y={offsetY} opacity={1} />}

          {layers.slice(1).map((l) => {
            const img = imageMap[l.imageFile];
            if (!img) return null;
            const anchorX = img.width / 2;
            const anchorY = img.height / 2;

            const t = l.imageTransform;
            if (!t) {
              return (
                <KonvaImage key={l.key} image={img} x={offsetX} y={offsetY} opacity={l.opacity} />
              );
            }

            return (
              <Group
                key={l.key}
                x={offsetX + t.x}
                y={offsetY + t.y}
                offsetX={anchorX}
                offsetY={anchorY}
                scaleX={t.scale}
                scaleY={t.scale}
                rotation={(t.rotation * 180) / Math.PI}
                opacity={l.opacity}
                globalCompositeOperation="multiply"
              >
                <KonvaImage image={img} x={0} y={0} />
              </Group>
            );
          })}
        </Layer>
      </Stage>
    </div>
  );
}
