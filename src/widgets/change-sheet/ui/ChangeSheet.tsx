import { Chip } from '@/shared/ui/Chip';

type Item = { id: string; title: string; subtitle?: string; movable?: boolean };

type Props = {
  items: Item[];
  onMove: (id: string) => void;
};

export function ChangeSheet({ items, onMove }: Props) {
  return (
    <section className="fixed bottom-0 left-0 right-0">
      <div className="rounded-t-3xl bg-white shadow-[0_-8px_30px_rgba(0,0,0,0.12)]">
        <div className="px-5 pt-4 pb-3 flex items-center justify-between">
          <div className="font-semibold">
            변경 항목 리스트 <span className="text-indigo-600">{items.length}건</span>
          </div>
        </div>

        <div className="px-4 pb-5 space-y-3 max-h-[34vh] overflow-y-auto">
          {items.length === 0 ? (
            <div className="text-slate-500 text-sm px-2 py-8 text-center">
              변경 항목이 없습니다.
            </div>
          ) : (
            items.map((it) => (
              <div
                key={it.id}
                className="rounded-2xl border bg-white p-4 flex items-start gap-3 overflow-hidden"
              >
                <Chip>{it.id}</Chip>

                <div className="flex-1 min-w-0">
                  <div className="font-semibold break-words whitespace-normal leading-5">
                    {it.title}
                  </div>
                  {it.subtitle && (
                    <div className="text-sm text-slate-500 break-words whitespace-normal leading-5 mt-1">
                      {it.subtitle}
                    </div>
                  )}
                </div>

                {it.movable === false ? null : (
                  <button
                    onClick={() => onMove(it.id)}
                    className="shrink-0 rounded-xl bg-indigo-600 text-white px-4 py-2 text-sm font-medium"
                  >
                    이동
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
