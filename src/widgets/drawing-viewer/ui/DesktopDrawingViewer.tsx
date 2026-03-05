import { Stage, Layer, Image as KonvaImage, Group } from 'react-konva';
import { useEffect, useRef, useState } from 'react';
import { Line } from 'react-konva';
import type { Polygon } from '@/entities/metadata/model/rawTypes';

type Transform = { x: number; y: number; scale: number; rotation: number };
type ImageLayerInput = {
  key: string;
  imageFile: string;
  opacity: number;
  imageTransform?: Transform;
};

function flattenVertices(vertices: [number, number][]) {
  return vertices.flatMap(([x, y]) => [x, y]);
}

function bboxOf(vertices: [number, number][]) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const [x, y] of vertices) {
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  }
  return { minX, minY, maxX, maxY };
}

function looksAlreadyInImageSpace(vertices: [number, number][], imgW: number, imgH: number) {
  const b = bboxOf(vertices);
  return b.minX >= -50 && b.minY >= -50 && b.maxX <= imgW + 50 && b.maxY <= imgH + 50;
}

export function DesktopDrawingViewer({
  layers,
  imageMap,
  polygon,
}: {
  layers: ImageLayerInput[];
  imageMap: Record<string, HTMLImageElement>;
  polygon?: Polygon;
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
  const shouldUseTransform = !!(
    polygon &&
    baseImg &&
    !looksAlreadyInImageSpace(polygon.vertices, baseImg.width, baseImg.height)
  );

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

          {polygon && (
            <Line
              points={flattenVertices(polygon.vertices)}
              closed
              x={offsetX + (shouldUseTransform ? polygon.polygonTransform.x : 0)}
              y={offsetY + (shouldUseTransform ? polygon.polygonTransform.y : 0)}
              scaleX={shouldUseTransform ? polygon.polygonTransform.scale : 1}
              scaleY={shouldUseTransform ? polygon.polygonTransform.scale : 1}
              rotation={
                shouldUseTransform ? (polygon.polygonTransform.rotation * 180) / Math.PI : 0
              }
              stroke="#f59e0b"
              strokeWidth={3}
              fill="rgba(245,158,11,0.18)"
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
}
