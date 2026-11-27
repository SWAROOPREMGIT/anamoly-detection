import { useAnimatedValue } from '../../hooks/useAnimatedValue';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
  decimals?: number;
}

export default function AnimatedCounter({
  value,
  duration = 1200,
  suffix = '',
  prefix = '',
  className = '',
  decimals = 0,
}: AnimatedCounterProps) {
  const multiplier = Math.pow(10, decimals);
  const animatedRaw = useAnimatedValue(Math.round(value * multiplier), duration);
  const display = decimals > 0 ? (animatedRaw / multiplier).toFixed(decimals) : animatedRaw;

  return (
    <span className={className}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}
