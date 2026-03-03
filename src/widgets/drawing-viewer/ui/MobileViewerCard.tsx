import { Stage, Layer, Image as KonvaImage } from 'react-konva';
import { useEffect, useRef, useState } from 'react';
import { IconButton } from '../../../shared/ui/IconButton';
import type { Polygon } from '@/entities/metadata/model/rawTypes';

type Props = {
  imageFile?: string; // ex) "13_주차장 ...png"
  polygon?: Polygon;
};

export function MobileViewerCard({ imageFile }: Props) {
  const stageRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [imageObj, setImageObj] = useState<HTMLImageElement | null>(null);
  const [scale, setScale] = useState(1);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!imageObj || !stageRef.current) return;
    if (size.width === 0 || size.height === 0) return;

    const scaleX = size.width / imageObj.width;
    const scaleY = size.height / imageObj.height;
    const fitScale = Math.min(scaleX, scaleY);

    setScale(fitScale);
  }, [imageObj, size.width, size.height]);

  useEffect(() => {
    if (!imageFile) return;
    const img = new window.Image();
    img.src = `/data/drawings/${encodeURIComponent(imageFile)}`;
    img.onload = () => setImageObj(img);
  }, [imageFile]);

  // 이미지 로드
  useEffect(() => {
    const img = new window.Image();
    img.src = '/data/drawings/13_주차장 지상1층 확대 평면도_구조.png';
    img.onload = () => setImageObj(img);
  }, []);

  // 컨테이너 크기 측정
  useEffect(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setSize({ width: rect.width, height: rect.height });
  }, []);

  let offsetX = 0;
  let offsetY = 0;

  if (imageObj) {
    offsetX = (size.width - imageObj.width * scale) / 2;
    offsetY = (size.height - imageObj.height * scale) / 2;
  }

  return (
    <div className="relative h-full">
      {/* Viewer card */}
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
          <Layer>{imageObj && <KonvaImage image={imageObj} x={offsetX} y={offsetY} />}</Layer>
        </Stage>
      </div>

      <div className="absolute right-6 top-24 flex flex-col gap-3">
        <IconButton ariaLabel="zoom in" onClick={() => setScale((prev) => prev * 1.1)}>
          +
        </IconButton>

        <IconButton ariaLabel="zoom out" onClick={() => setScale((prev) => prev / 1.1)}>
          −
        </IconButton>
      </div>
    </div>
  );
}
