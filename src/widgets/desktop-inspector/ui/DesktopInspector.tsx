type Props = {
  breadcrumb: string;
  subtitle?: string;
  discipline?: string;
  revision?: string;
  changeItems: { id: string; title: string }[];
};

export function DesktopInspector({
  breadcrumb,
  subtitle,
  discipline,
  revision,
  changeItems,
}: Props) {
  return (
    <div className="p-5 space-y-6">
      <div>
        <div className="font-semibold text-lg">{breadcrumb}</div>
        {subtitle && <div className="text-sm text-slate-500 mt-1">{subtitle}</div>}
      </div>

      <div>
        <div className="font-semibold mb-2">선택 정보</div>
        <div className="text-sm space-y-1 text-slate-600">
          <div>공종: {discipline ?? '-'}</div>
          <div>리비전: {revision ?? '-'}</div>
        </div>
      </div>

      <div>
        <div className="font-semibold mb-2">변경 항목</div>
        <div className="space-y-2">
          {changeItems.length === 0 ? (
            <div className="text-sm text-slate-400">변경 항목 없음</div>
          ) : (
            changeItems.map((c) => (
              <div key={c.id} className="text-sm border rounded-lg px-3 py-2 bg-slate-50">
                <span className="font-medium mr-2">{c.id}</span>
                {c.title}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
