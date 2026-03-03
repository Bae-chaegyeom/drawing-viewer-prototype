import { Stage, Layer, Image as KonvaImage } from 'react-konva';
import { useEffect, useRef, useState } from 'react';
import { IconButton } from '../../../shared/ui/IconButton';
import type { Polygon } from '@/entities/metadata/model/rawTypes';
import { Line } from 'react-konva';

type Props = {
  imageFile?: string; // ex) "13_주차장 ...png"
  polygon?: Polygon;
};

function flattenVertices(vertices: [number, number][]) {
  return vertices.flatMap(([x, y]) => [x, y]);
}

export function MobileViewerCard({ imageFile, polygon }: Props) {
  const stageRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [imageObj, setImageObj] = useState<HTMLImageElement | null>(null);
  const [scale, setScale] = useState(1);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [usePolyTransform, setUsePolyTransform] = useState(false);

  useEffect(() => {
    if (!imageObj) return;
    if (size.width === 0 || size.height === 0) return;

    const fitScale = Math.min(size.width / imageObj.width, size.height / imageObj.height);
    setScale(fitScale);
  }, [imageObj, size.width, size.height]);

  useEffect(() => {
    if (!imageFile) {
      setImageObj(null);
      return;
    }
    const img = new window.Image();
    img.src = `/data/drawings/${encodeURIComponent(imageFile)}`;
    img.onload = () => setImageObj(img);
  }, [imageFile]);

  // 컨테이너 크기 측정
  useEffect(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setSize({ width: rect.width, height: rect.height });
  }, []);

  const offsetX = imageObj ? (size.width / scale - imageObj.width) / 2 : 0;
  const offsetY = imageObj ? (size.height / scale - imageObj.height) / 2 : 0;

  return (
    <div className="relative h-full">
      <div
        ref={containerRef}
        className="mx-4 mt-4 h-[calc(100%-1rem)] rounded-2xl bg-white shadow overflow-hidden"
      >
        <Stage
          width={size.width}
          height={size.height}
          scaleX={scale}
          scaleY={scale}
          ref={stageRef}
          draggable
        >
          <Layer>
            {imageObj && <KonvaImage image={imageObj} x={offsetX} y={offsetY} />}

            {polygon && (
              <Line
                points={flattenVertices(polygon.vertices)}
                closed
                x={offsetX + (usePolyTransform ? polygon.polygonTransform.x : 0)}
                y={offsetY + (usePolyTransform ? polygon.polygonTransform.y : 0)}
                scaleX={usePolyTransform ? polygon.polygonTransform.scale : 1}
                scaleY={usePolyTransform ? polygon.polygonTransform.scale : 1}
                rotation={
                  usePolyTransform ? (polygon.polygonTransform.rotation * 180) / Math.PI : 0
                }
                stroke="#f59e0b"
                strokeWidth={4}
                fill="rgba(245,158,11,0.18)"
              />
            )}
          </Layer>
        </Stage>
      </div>

      <div className="absolute right-6 top-24 flex flex-col gap-3">
        <IconButton ariaLabel="zoom in" onClick={() => setScale((prev) => prev * 1.1)}>
          +
        </IconButton>

        <IconButton ariaLabel="zoom out" onClick={() => setScale((prev) => prev / 1.1)}>
          −
        </IconButton>

        <IconButton
          ariaLabel="toggle polygon transform"
          onClick={() => setUsePolyTransform((v) => !v)}
        >
          T
        </IconButton>
      </div>
    </div>
  );
}
