import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-white/[0.04] bg-zinc-950/40 backdrop-blur-md ${className}`}
    >
      {icon && (
        <div className="w-14 h-14 mb-4 rounded-2xl bg-zinc-900/80 border border-white/[0.06] flex items-center justify-center text-zinc-400 shadow-inner">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-zinc-200 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-zinc-400 max-w-sm mb-5 leading-relaxed">
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </motion.div>
  );
}
