import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  className?: string;
}

const sizeMap = {
  sm: 'w-5 h-5 border-2',
  md: 'w-8 h-8 border-2',
  lg: 'w-12 h-12 border-3',
  xl: 'w-16 h-16 border-4',
};

export default function LoadingSpinner({
  size = 'md',
  text,
  className = '',
}: LoadingSpinnerProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div className="relative flex items-center justify-center">
        {/* Outer glowing ring */}
        <motion.div
          className={`rounded-full border-t-cyan-400 border-r-blue-500 border-b-purple-500 border-l-transparent ${sizeMap[size]}`}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
        {/* Inner pulsing dot */}
        <motion.div
          className="absolute w-2 h-2 rounded-full bg-cyan-400"
          animate={{ scale: [0.8, 1.3, 0.8], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
      {text && (
        <p className="text-xs font-mono uppercase tracking-widest text-zinc-400 animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
}
