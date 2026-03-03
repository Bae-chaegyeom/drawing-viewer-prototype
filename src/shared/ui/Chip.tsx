export function Chip({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 font-bold flex items-center justify-center">
      {children}
    </div>
  );
}
