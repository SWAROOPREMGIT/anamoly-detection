export const API_BASE_URL = 'http://localhost:5000';

export const SEVERITY_COLORS = {
  high: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30', glow: 'shadow-glow-red' },
  medium: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30', glow: 'shadow-glow-amber' },
  low: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30', glow: 'shadow-glow-blue' },
} as const;

export const CLASS_COLORS: Record<string, string> = {
  Normal: '#10b981',
  Fight: '#ef4444',
  Violence: '#ef4444',
  Fall: '#f59e0b',
  Intrusion: '#8b5cf6',
  Abuse: '#ec4899',
  Arson: '#f97316',
  Assault: '#dc2626',
  Burglary: '#a855f7',
  Explosion: '#f43f5e',
  Fighting: '#ef4444',
  RoadAccidents: '#eab308',
  Robbery: '#c084fc',
  Shooting: '#b91c1c',
  Shoplifting: '#d946ef',
  Stealing: '#a78bfa',
  Vandalism: '#fb923c',
  Anomaly: '#ef4444',
};

export const CLASS_ICONS: Record<string, string> = {
  Normal: '✅',
  Fight: '👊',
  Violence: '⚠️',
  Fall: '🚨',
  Intrusion: '🚷',
  Anomaly: '🔴',
};

export const CAMERA_TYPES = [
  { value: 'ip', label: 'IP Camera' },
  { value: 'usb', label: 'USB Camera' },
  { value: 'rtsp', label: 'RTSP Stream' },
  { value: 'file', label: 'Video File' },
] as const;

export const CHART_COLORS = ['#3b82f6', '#06b6d4', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6', '#ec4899', '#f97316'];

export const SUPPORTED_VIDEO_FORMATS = ['.mp4', '.avi', '.mov', '.mkv', '.wmv', '.flv', '.webm'];
