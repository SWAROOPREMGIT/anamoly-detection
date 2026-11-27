import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: 'blue' | 'cyan' | 'green' | 'red' | 'amber' | 'purple';
  onClick?: () => void;
}

const glowMap = {
  blue: 'shadow-glow-blue',
  cyan: 'shadow-glow-cyan',
  green: 'shadow-glow-green',
  red: 'shadow-glow-red',
  amber: 'shadow-glow-amber',
  purple: 'shadow-glow-purple',
};

export default function GlassCard({ children, className = '', hover = false, glow, onClick }: GlassCardProps) {
  return (
    <motion.div
      className={`
        relative rounded-2xl
        bg-[rgba(17,17,24,0.6)] backdrop-blur-xl
        border border-white/[0.06]
        ${glow ? glowMap[glow] : ''}
        ${hover ? 'cursor-pointer transition-all duration-300 hover:bg-[rgba(17,17,24,0.8)] hover:border-white/[0.1] hover:shadow-lg' : ''}
        ${className}
      `}
      whileHover={hover ? { y: -2, scale: 1.005 } : undefined}
      whileTap={hover ? { scale: 0.995 } : undefined}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}
