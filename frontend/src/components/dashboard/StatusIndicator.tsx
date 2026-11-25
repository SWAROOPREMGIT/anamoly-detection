interface StatusIndicatorProps {
  status: 'online' | 'offline' | 'warning' | 'standby';
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

const statusConfig = {
  online: {
    dot: 'bg-emerald-400',
    ping: 'bg-emerald-400',
    text: 'text-emerald-400',
    defaultLabel: 'OPERATIONAL',
  },
  offline: {
    dot: 'bg-zinc-500',
    ping: 'bg-zinc-500',
    text: 'text-zinc-500',
    defaultLabel: 'OFFLINE',
  },
  warning: {
    dot: 'bg-amber-400',
    ping: 'bg-amber-400',
    text: 'text-amber-400',
    defaultLabel: 'DEGRADED',
  },
  standby: {
    dot: 'bg-cyan-400',
    ping: 'bg-cyan-400',
    text: 'text-cyan-400',
    defaultLabel: 'STANDBY',
  },
};

const sizeConfig = {
  sm: 'w-1.5 h-1.5',
  md: 'w-2 h-2',
  lg: 'w-2.5 h-2.5',
};

export default function StatusIndicator({
  status,
  label,
  size = 'md',
}: StatusIndicatorProps) {
  const config = statusConfig[status];
  const sizeClass = sizeConfig[size];

  return (
    <div className="inline-flex items-center gap-2 font-mono text-xs">
      <span className="relative flex items-center justify-center">
        {status !== 'offline' && (
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${config.ping} ${sizeClass}`}
          />
        )}
        <span
          className={`relative inline-flex rounded-full ${config.dot} ${sizeClass}`}
        />
      </span>
      <span className={`font-semibold tracking-wider ${config.text}`}>
        {label || config.defaultLabel}
      </span>
    </div>
  );
}
