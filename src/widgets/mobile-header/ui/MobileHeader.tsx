import { IconButton } from '@/shared/ui/IconButton';

type Props = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  onMenu?: () => void;
};

export function MobileHeader({ title, subtitle, onBack, onMenu }: Props) {
  return (
    <header className="sticky top-0 z-10 bg-white border-b">
      <div className="h-14 px-3 flex items-center gap-2">
        <IconButton ariaLabel="back" onClick={onBack}>
          ←
        </IconButton>

        <div className="flex-1 min-w-0">
          <div className="font-semibold text-[15px] truncate">{title}</div>
          {subtitle && <div className="text-xs text-slate-500 truncate">{subtitle}</div>}
        </div>

        <IconButton ariaLabel="menu" onClick={onMenu}>
          ⋮
        </IconButton>
      </div>
    </header>
  );
}
