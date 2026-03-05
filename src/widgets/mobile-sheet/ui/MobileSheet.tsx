export function MobileSheet({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      {/* sheet */}
      <div className="absolute bottom-0 left-0 right-0 rounded-t-3xl bg-white shadow-[0_-8px_30px_rgba(0,0,0,0.18)]">
        <div className="px-5 pt-4 pb-3 flex items-center justify-between">
          <div className="font-semibold">{title}</div>
          <button className="text-slate-500" onClick={onClose}>
            닫기
          </button>
        </div>
        <div className="px-5 pb-6">{children}</div>
      </div>
    </div>
  );
}
