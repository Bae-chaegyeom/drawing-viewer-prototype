import { type ReactNode } from 'react';

export function DesktopLayout({
  left,
  center,
  right,
}: {
  left: ReactNode;
  center: ReactNode;
  right: ReactNode;
}) {
  return (
    <div className="hidden lg:grid h-dvh grid-cols-[320px_1fr_360px] bg-slate-100">
      <aside className="border-r bg-white">{left}</aside>
      <main className="p-6 overflow-hidden">{center}</main>
      <aside className="border-l bg-white">{right}</aside>
    </div>
  );
}
