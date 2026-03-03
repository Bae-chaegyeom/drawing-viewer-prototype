import { IconButton } from '@/shared/ui/IconButton';

export function MobileViewerCard() {
  return (
    <div className="relative h-full">
      {/* Viewer card */}
      <div className="mx-4 mt-4 h-[calc(100%-1rem)] rounded-2xl bg-white shadow overflow-hidden">
        {/* Konva Stage 들어갈 자리(Commit 8에서 교체) */}
        <div className="h-full flex items-center justify-center text-slate-400">
          Viewer Placeholder (Konva in Commit 8)
        </div>
      </div>

      {/* Floating controls */}
      <div className="absolute right-6 top-24 flex flex-col gap-3">
        <IconButton ariaLabel="zoom in" className="w-14 h-14 text-2xl">
          +
        </IconButton>
        <IconButton ariaLabel="zoom out" className="w-14 h-14 text-2xl">
          −
        </IconButton>
        <IconButton ariaLabel="layers" className="w-14 h-14 text-xl">
          ⧉
        </IconButton>
      </div>

      {/* Bottom mode pill (줌/이동 토글처럼 보이게) */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-24">
        <div className="rounded-full bg-slate-700 text-white text-sm px-6 py-2 flex gap-8 shadow">
          <button className="opacity-90">줌</button>
          <button className="opacity-90">이동</button>
        </div>
      </div>
    </div>
  );
}
