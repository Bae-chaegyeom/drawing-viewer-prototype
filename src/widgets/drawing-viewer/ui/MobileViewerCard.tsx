import { forwardRef, useImperativeHandle } from 'react';
import { Stage, Layer, Image as KonvaImage } from 'react-konva';
import { useEffect, useRef, useState } from 'react';
import { IconButton } from '../../../shared/ui/IconButton';
import type { Polygon } from '@/entities/metadata/model/rawTypes';
import { Line } from 'react-konva';

type Props = {
  imageFile?: string; // ex) "13_주차장 ...png"
  polygon?: Polygon;
};

export type MobileViewerHandle = {
  focusToPolygon: (polygon: Polygon) => void;
};

function applyPointTransform(
  p: { x: number; y: number },
  t: { x: number; y: number; scale: number; rotation: number },
) {
  const cos = Math.cos(t.rotation);
  const sin = Math.sin(t.rotation);

  const sx = p.x * t.scale;
  const sy = p.y * t.scale;

  const rx = sx * cos - sy * sin;
  const ry = sx * sin + sy * cos;

  return { x: rx + t.x, y: ry + t.y };
}

function flattenVertices(vertices: [number, number][]) {
  return vertices.flatMap(([x, y]) => [x, y]);
}

function bboxOf(vertices: [number, number][]) {
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
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

  const within = b.minX >= -50 && b.minY >= -50 && b.maxX <= imgW + 50 && b.maxY <= imgH + 50;
  return within;
}

export const MobileViewerCard = forwardRef<MobileViewerHandle, Props>(
  ({ imageFile, polygon }, ref) => {
    const stageRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const [imageObj, setImageObj] = useState<HTMLImageElement | null>(null);
    const [scale, setScale] = useState(1);
    const [size, setSize] = useState({ width: 0, height: 0 });

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

    useEffect(() => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setSize({ width: rect.width, height: rect.height });
    }, []);

    const offsetX = imageObj ? (size.width / scale - imageObj.width) / 2 : 0;
    const offsetY = imageObj ? (size.height / scale - imageObj.height) / 2 : 0;

    function getPolygonCenter(vertices: [number, number][]) {
      let minX = Infinity,
        minY = Infinity,
        maxX = -Infinity,
        maxY = -Infinity;
      for (const [x, y] of vertices) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
      return { x: (minX + maxX) / 2, y: (minY + maxY) / 2 };
    }

    useImperativeHandle(
      ref,
      () => ({
        focusToPolygon: (poly: Polygon) => {
          const stage = stageRef.current;
          if (!stage) return;
          if (size.width === 0 || size.height === 0) return;

          const c = getPolygonCenter(poly.vertices);

          const shouldUseTransform = imageObj
            ? !looksAlreadyInImageSpace(poly.vertices, imageObj.width, imageObj.height)
            : false;

          const worldCenter = shouldUseTransform
            ? applyPointTransform(c, poly.polygonTransform)
            : c;

          const worldX = offsetX + worldCenter.x;
          const worldY = offsetY + worldCenter.y;

          const newX = size.width / 2 - worldX * scale;
          const newY = size.height / 2 - worldY * scale;

          stage.position({ x: newX, y: newY });
          stage.batchDraw();
          stage.draw();
        },
      }),
      [offsetX, offsetY, scale, size.width, size.height],
    );

    const shouldUseTransform =
      polygon && imageObj
        ? !looksAlreadyInImageSpace(polygon.vertices, imageObj.width, imageObj.height)
        : false;

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
                  x={offsetX + (shouldUseTransform ? polygon.polygonTransform.x : 0)}
                  y={offsetY + (shouldUseTransform ? polygon.polygonTransform.y : 0)}
                  scaleX={shouldUseTransform ? polygon.polygonTransform.scale : 1}
                  scaleY={shouldUseTransform ? polygon.polygonTransform.scale : 1}
                  rotation={
                    shouldUseTransform ? (polygon.polygonTransform.rotation * 180) / Math.PI : 0
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

          <IconButton ariaLabel="toggle polygon transform">T</IconButton>
        </div>
      </div>
    );
  },
);
