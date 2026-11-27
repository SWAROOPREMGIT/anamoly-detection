import { Radio, ShieldAlert } from 'lucide-react';
import PageTransition from '../components/layout/PageTransition';
import LiveMonitor from '../components/monitoring/LiveMonitor';

export default function LiveMonitoring() {
  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Radio className="w-5 h-5 text-emerald-400 animate-pulse" />
              <h2 className="text-xl font-bold tracking-tight text-white font-mono">
                REAL-TIME OPTICAL SURVEILLANCE
              </h2>
            </div>
            <p className="text-xs text-zinc-400 font-mono">
              Direct webcam & RTSP stream monitoring with frame-by-frame
              ConvLSTM inference.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-white/5 font-mono text-xs text-zinc-300 flex items-center gap-2">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              AUTO-ALERT DISPATCH: <span className="text-emerald-400 font-bold">ENABLED</span>
            </span>
          </div>
        </div>

        {/* Live Monitoring Core Viewport */}
        <LiveMonitor />
      </div>
    </PageTransition>
  );
}

