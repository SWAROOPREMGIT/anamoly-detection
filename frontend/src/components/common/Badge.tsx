import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'danger' | 'warning' | 'info' | 'purple';
  size?: 'sm' | 'md';
  pulse?: boolean;
  className?: string;
}

const variantStyles = {
  default: 'bg-zinc-800/80 text-zinc-300 border-zinc-700/50',
  success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.15)]',
  danger: 'bg-rose-500/10 text-rose-400 border-rose-500/30 shadow-[0_0_12px_rgba(244,63,94,0.15)]',
  warning: 'bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.15)]',
  info: 'bg-sky-500/10 text-sky-400 border-sky-500/30 shadow-[0_0_12px_rgba(14,165,233,0.15)]',
  purple: 'bg-purple-500/10 text-purple-400 border-purple-500/30 shadow-[0_0_12px_rgba(168,85,247,0.15)]',
};

const pulseStyles = {
  default: 'bg-zinc-400',
  success: 'bg-emerald-400',
  danger: 'bg-rose-400',
  warning: 'bg-amber-400',
  info: 'bg-sky-400',
  purple: 'bg-purple-400',
};

export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  pulse = false,
  className = '',
}: BadgeProps) {
  const sizeStyle = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border backdrop-blur-md transition-colors ${sizeStyle} ${variantStyles[variant]} ${className}`}
    >
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${pulseStyles[variant]}`}
          />
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${pulseStyles[variant]}`}
          />
        </span>
      )}
      {children}
    </span>
  );
}
