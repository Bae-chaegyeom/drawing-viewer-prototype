import { Stage, Layer, Image as KonvaImage } from 'react-konva';
import { useEffect, useRef, useState } from 'react';

export function MobileViewerCard() {
  const stageRef = useRef<any>(null);
  const [imageObj, setImageObj] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new window.Image();
    img.src = '/data/drawings/13_주차장 지상1층 확대 평면도_구조.png';
    img.onload = () => setImageObj(img);
  }, []);

  return (
    <div className="relative h-full">
      <div className="mx-4 mt-4 h-[calc(100%-1rem)] rounded-2xl bg-white shadow overflow-hidden">
        <Stage width={window.innerWidth - 32} height={window.innerHeight * 0.6} ref={stageRef}>
          <Layer>{imageObj && <KonvaImage image={imageObj} x={0} y={0} />}</Layer>
        </Stage>
      </div>
    </div>
  );
}
