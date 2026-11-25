import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Square, Activity, ShieldAlert, Cpu } from 'lucide-react';
import CameraFeed from './CameraFeed';
import client from '../../api/client';
import { formatConfidence } from '../../utils/formatters';

interface LiveEvent {
  frame: number;
  class: string;
  confidence: number;
  timestamp: string;
}

export default function LiveMonitor() {
  const [active, setActive] = useState(false);
  const [source, setSource] = useState('0');
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [currentResult, setCurrentResult] = useState<{
    class: string;
    confidence: number;
    frame: number;
  }>({
    class: 'Normal Activity',
    confidence: 0.95,
    frame: 0,
  });

  const eventSourceRef = useRef<EventSource | null>(null);

  // Poll status on mount
  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const res = await client.get('/api/live/status');
      if (res.data?.active) {
        setActive(true);
        if (res.data.source) setSource(String(res.data.source));
        startEventStream();
      }
    } catch {
      // Backend status unavailable
    }
  };

  const startEventStream = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    try {
      const es = new EventSource('http://localhost:5000/api/live/feed');
      eventSourceRef.current = es;

      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data && data.class) {
            setCurrentResult({
              class: data.class,
              confidence: data.confidence,
              frame: data.frame || 0,
            });
            setEvents((prev) => [data, ...prev.slice(0, 19)]);
          }
        } catch {
          // Heartbeat or parse error
        }
      };

      es.onerror = () => {
        // SSE error, will auto-retry
      };
    } catch {
      // EventSource failed
    }
  };

  const handleStart = async () => {
    setLoading(true);
    try {
      await client.post('/api/live/start', { source });
      setActive(true);
      startEventStream();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to initiate camera';
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    setLoading(true);
    try {
      await client.post('/api/live/stop');
      setActive(false);
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to stop camera';
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const isAnomaly = currentResult.class !== 'Normal Activity';

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="p-4 rounded-2xl bg-zinc-950/60 border border-white/[0.06] backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <label className="text-xs font-mono text-zinc-400 uppercase">
            Optical Source:
          </label>
          <select
            value={source}
            onChange={(e) => setSource(e.target.value)}
            disabled={active || loading}
            className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="0">Camera 0 (Default Webcam)</option>
            <option value="1">Camera 1 (Secondary)</option>
            <option value="rtsp://demo-cam-1">RTSP Stream: Sector 01</option>
            <option value="rtsp://demo-cam-2">RTSP Stream: Sector 02</option>
          </select>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {active ? (
            <button
              onClick={handleStop}
              disabled={loading}
              className="w-full sm:w-auto px-5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-mono text-xs font-semibold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(244,63,94,0.3)] transition-all active:scale-95"
            >
              <Square className="w-4 h-4 fill-current" />
              <span>{loading ? 'Disengaging...' : 'Stop Surveillance'}</span>
            </button>
          ) : (
            <button
              onClick={handleStart}
              disabled={loading}
              className="w-full sm:w-auto px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-mono text-xs font-semibold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all active:scale-95"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{loading ? 'Connecting...' : 'Engage Optical Feed'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Monitoring Viewport and Telemetry Rail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Large Camera Viewport */}
        <div className="lg:col-span-2">
          <CameraFeed
            active={active}
            cameraName={`SECTOR CAM // SOURCE #${source}`}
            currentPrediction={currentResult.class}
            currentConfidence={currentResult.confidence}
          />
        </div>

        {/* Right 1 Col: Live AI Telemetry */}
        <div className="space-y-4">
          {/* Current Inference Card */}
          <div
            className={`p-5 rounded-2xl border backdrop-blur-xl transition-all ${
              active && isAnomaly
                ? 'bg-rose-950/30 border-rose-500/40 shadow-[0_0_25px_rgba(244,63,94,0.15)]'
                : 'bg-zinc-950/60 border-white/[0.06]'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-mono uppercase text-zinc-400 tracking-wider">
                Live Neural Inference
              </span>
              <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
            </div>

            <div className="flex items-center gap-3 mb-4">
              <div
                className={`p-3 rounded-xl border ${
                  active && isAnomaly
                    ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                    : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                }`}
              >
                {active && isAnomaly ? (
                  <ShieldAlert className="w-6 h-6" />
                ) : (
                  <Cpu className="w-6 h-6" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-wide">
                  {active ? currentResult.class : 'System Idle'}
                </h3>
                <span className="text-xs font-mono text-zinc-400">
                  {active
                    ? `Confidence: ${formatConfidence(currentResult.confidence)}`
                    : 'Awaiting feed initialization'}
                </span>
              </div>
            </div>

            {/* Gauge */}
            {active && (
              <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden border border-white/5">
                <motion.div
                  className={`h-2 rounded-full ${
                    isAnomaly
                      ? 'bg-gradient-to-r from-rose-500 to-amber-500'
                      : 'bg-gradient-to-r from-emerald-500 to-cyan-500'
                  }`}
                  animate={{ width: `${currentResult.confidence * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            )}
          </div>

          {/* Real-time Event Log */}
          <div className="p-4 rounded-2xl bg-zinc-950/60 border border-white/[0.06] backdrop-blur-xl">
            <h4 className="text-xs font-mono uppercase text-zinc-400 tracking-wider mb-3">
              Recent Frame Telemetry
            </h4>

            {events.length === 0 ? (
              <div className="p-6 text-center text-xs font-mono text-zinc-400">
                AWAITING LIVE STREAM FRAMES...
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {events.map((ev, i) => (
                  <div
                    key={i}
                    className="p-2 rounded-lg bg-zinc-900/60 border border-white/[0.02] flex items-center justify-between font-mono text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-400">F#{ev.frame}</span>
                      <span
                        className={`font-semibold ${
                          ev.class !== 'Normal Activity'
                            ? 'text-rose-400'
                            : 'text-emerald-400'
                        }`}
                      >
                        {ev.class}
                      </span>
                    </div>
                    <span className="text-zinc-300">
                      {(ev.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

