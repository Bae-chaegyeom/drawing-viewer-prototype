import React from 'react';

type Props = {
  children: React.ReactNode;
  ariaLabel: string;
  className?: string;
};

export function IconButton({ children, ariaLabel, className }: Props) {
  const base = 'w-10 h-10 rounded-2xl bg-white shadow flex items-center justify-center border';
  const merged = className ? `${base} ${className}` : base;

  return (
    <button aria-label={ariaLabel} className={merged}>
      {children}
    </button>
  );
}
