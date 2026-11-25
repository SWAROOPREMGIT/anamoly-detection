import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Bell, Wifi, Cpu, Clock, RefreshCw, Maximize2, Minimize2 } from 'lucide-react';
import { useApi } from '../../hooks/useApi';

interface HeaderProps {
  sidebarCollapsed: boolean;
}

export default function Header({ sidebarCollapsed }: HeaderProps) {
  const location = useLocation();
  const [timeStr, setTimeStr] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Fetch alert stats for notification badge
  const { data: alertStats, refetch: refetchAlerts } = useApi<{
    total: number;
    unacknowledged: number;
    by_severity: { high: number; medium: number; low: number };
  }>('/api/alerts/stats');

  // Fetch system status
  const { data: sysStatus, refetch: refetchStatus } = useApi<{
    status: string;
    model_loaded: boolean;
    monitoring_active: boolean;
    classes_supported: string[];
  }>('/api/system/status');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }) +
          ' UTC' +
          (now.getTimezoneOffset() <= 0 ? '+' : '-') +
          Math.abs(now.getTimezoneOffset() / 60)
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const getPageTitle = (path: string) => {
    switch (path) {
      case '/':
        return 'SURVEILLANCE COMMAND CENTER';
      case '/detection':
        return 'AI VIDEO INFERENCE & CLASSIFICATION';
      case '/monitoring':
        return 'REAL-TIME OPTICAL MONITORING';
      case '/alerts':
        return 'SECURITY INCIDENT MANAGEMENT';
      case '/analytics':
        return 'NEURAL METRICS & FORENSIC ANALYTICS';
      case '/cameras':
        return 'CCTV & SENSOR FLEET CONFIGURATION';
      default:
        return 'DEFENSE CONSOLE';
    }
  };

  return (
    <header
      className={`fixed top-0 right-0 z-30 h-16 border-b border-white/[0.06] bg-[#0a0a0f]/80 backdrop-blur-xl transition-all duration-300 px-6 flex items-center justify-between ${
        sidebarCollapsed ? 'left-20' : 'left-64'
      }`}
    >
      {/* Page Title & Breadcrumb */}
      <div className="flex items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
            <h1 className="text-sm font-bold tracking-widest text-zinc-200 font-mono">
              {getPageTitle(location.pathname)}
            </h1>
          </div>
          <span className="text-[11px] text-zinc-400 font-mono">
            SEC-LEVEL: ALPHA // SYSTEM ONLINE
          </span>
        </div>
      </div>

      {/* Control indicators and metrics */}
      <div className="flex items-center gap-3">
        {/* Real-time Clock */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-950/60 border border-white/[0.04] text-zinc-400 font-mono text-xs shadow-inner">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>{timeStr || '--:--:--'}</span>
        </div>

        {/* Model Status Pill */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-950/60 border border-white/[0.04] font-mono text-xs">
          <Cpu className="w-3.5 h-3.5 text-purple-400" />
          <span className="text-zinc-400">ConvLSTM-2D:</span>
          <span
            className={`font-semibold ${
              sysStatus?.model_loaded ? 'text-emerald-400' : 'text-amber-400'
            }`}
          >
            {sysStatus?.model_loaded ? 'READY' : 'ARCH ONLY'}
          </span>
        </div>

        {/* Live Stream / Connection Status */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-950/60 border border-white/[0.04] font-mono text-xs">
          <Wifi className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span className="hidden sm:inline text-zinc-400">FEED:</span>
          <span className="text-emerald-400 font-semibold">99.8% STABLE</span>
        </div>

        {/* Quick Refresh */}
        <button
          onClick={() => {
            refetchAlerts();
            refetchStatus();
          }}
          title="Refresh Telemetry"
          aria-label="Refresh telemetry"
          className="p-2 rounded-lg bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-white/[0.04] transition-all"
        >
          <RefreshCw className="w-4 h-4 active:rotate-180 transition-transform duration-500" />
        </button>

        {/* Fullscreen Toggle */}
        <button
          onClick={toggleFullscreen}
          title="Toggle Command Viewport"
          aria-label="Toggle command viewport"
          className="hidden sm:flex p-2 rounded-lg bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-white/[0.04] transition-all"
        >
          {isFullscreen ? (
            <Minimize2 className="w-4 h-4 text-zinc-400" />
          ) : (
            <Maximize2 className="w-4 h-4 text-zinc-400" />
          )}
        </button>

        {/* Alert Notification Bell */}
        <Link
          to="/alerts"
          aria-label="View security incident alerts"
          className="relative p-2 rounded-lg bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-white/[0.04] transition-all"
        >
          <Bell className="w-4 h-4" />
          {(alertStats?.unacknowledged ?? 0) > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-[1rem] px-1 items-center justify-center rounded-full bg-rose-500 text-[9px] font-mono font-bold text-white shadow-[0_0_8px_rgba(244,63,94,0.8)] animate-pulse">
              {alertStats?.unacknowledged}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
