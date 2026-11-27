import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import AnimatedCounter from '../common/AnimatedCounter';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  trend?: {
    value: string;
    positive: boolean;
  };
  subtitle?: string;
  icon: ReactNode;
  glowColor?: 'blue' | 'cyan' | 'emerald' | 'rose' | 'purple' | 'amber';
  delay?: number;
}

const colorVariants = {
  blue: {
    border: 'hover:border-blue-500/40',
    glow: 'group-hover:shadow-[0_0_25px_rgba(59,130,246,0.2)]',
    iconBg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    accent: 'from-blue-500/20 to-transparent',
  },
  cyan: {
    border: 'hover:border-cyan-500/40',
    glow: 'group-hover:shadow-[0_0_25px_rgba(6,182,212,0.2)]',
    iconBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    accent: 'from-cyan-500/20 to-transparent',
  },
  emerald: {
    border: 'hover:border-emerald-500/40',
    glow: 'group-hover:shadow-[0_0_25px_rgba(16,185,129,0.2)]',
    iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    accent: 'from-emerald-500/20 to-transparent',
  },
  rose: {
    border: 'hover:border-rose-500/40',
    glow: 'group-hover:shadow-[0_0_25px_rgba(244,63,94,0.2)]',
    iconBg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    accent: 'from-rose-500/20 to-transparent',
  },
  purple: {
    border: 'hover:border-purple-500/40',
    glow: 'group-hover:shadow-[0_0_25px_rgba(168,85,247,0.2)]',
    iconBg: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    accent: 'from-purple-500/20 to-transparent',
  },
  amber: {
    border: 'hover:border-amber-500/40',
    glow: 'group-hover:shadow-[0_0_25px_rgba(245,158,11,0.2)]',
    iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    accent: 'from-amber-500/20 to-transparent',
  },
};

export default function StatCard({
  title,
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  trend,
  subtitle,
  icon,
  glowColor = 'cyan',
  delay = 0,
}: StatCardProps) {
  const scheme = colorVariants[glowColor];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className={`group relative p-5 rounded-2xl bg-zinc-950/60 backdrop-blur-xl border border-white/[0.06] ${scheme.border} ${scheme.glow} transition-all duration-300 overflow-hidden shadow-lg`}
    >
      {/* Top subtle gradient highlight */}
      <div
        className={`absolute -top-12 -right-12 w-28 h-28 rounded-full bg-gradient-to-br ${scheme.accent} blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500`}
      />

      <div className="flex items-start justify-between relative z-10">
        <div>
          <span className="text-[11px] font-mono tracking-widest text-zinc-400 uppercase font-semibold">
            {title}
          </span>
          <div className="mt-2 flex items-baseline gap-1 font-mono">
            <span className="text-3xl font-extrabold tracking-tight text-white">
              <AnimatedCounter
                value={value}
                prefix={prefix}
                suffix={suffix}
                decimals={decimals}
              />
            </span>
          </div>
        </div>

        {/* Icon Container */}
        <div
          className={`p-3 rounded-xl border backdrop-blur-md ${scheme.iconBg} group-hover:scale-110 transition-transform duration-300`}
        >
          {icon}
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-4 pt-3 border-t border-white/[0.04] flex items-center justify-between text-xs font-mono relative z-10">
        {subtitle && <span className="text-zinc-400">{subtitle}</span>}
        {trend && (
          <div
            className={`flex items-center gap-1 font-semibold ${
              trend.positive ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {trend.positive ? (
              <ArrowUpRight className="w-3.5 h-3.5" />
            ) : (
              <ArrowDownRight className="w-3.5 h-3.5" />
            )}
            <span>{trend.value}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
