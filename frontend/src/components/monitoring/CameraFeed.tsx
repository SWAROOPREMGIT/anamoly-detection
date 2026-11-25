import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Radio, Crosshair, Camera, AlertTriangle, Eye } from 'lucide-react';
import Badge from '../common/Badge';

interface CameraFeedProps {
  cameraId?: string;
  cameraName?: string;
  sourceUrl?: string;
  active?: boolean;
  currentPrediction?: string;
  currentConfidence?: number;
}

export default function CameraFeed({
  cameraName = 'PRIMARY CCTV - SECTOR 1',
  active = false,
  currentPrediction = 'Normal Activity',
  currentConfidence = 0.94,
}: CameraFeedProps) {
  const [timestamp, setTimestamp] = useState('');
  const [hasWebcam, setHasWebcam] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const isAnomaly = currentPrediction !== 'Normal Activity';

  // Clock HUD
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimestamp(
        now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Real Webcam capture when active
  useEffect(() => {
    let mounted = true;

    async function initWebcam() {
      if (!active) {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
        setHasWebcam(false);
        return;
      }

      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 1280 }, height: { ideal: 720 } },
            audio: false,
          });
          if (!mounted) {
            stream.getTracks().forEach((t) => t.stop());
            return;
          }
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(() => {});
          }
          setHasWebcam(true);
        }
      } catch {
        // Fallback to simulated HUD
        setHasWebcam(false);
      }
    }

    initWebcam();

    return () => {
      mounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [active]);

  return (
    <div className="relative w-full aspect-video bg-[#050508] rounded-2xl overflow-hidden border border-white/[0.08] shadow-[0_0_50px_rgba(0,0,0,0.8)]">
      {/* Live Video Element (Webcam) or Cyber Simulation */}
      {hasWebcam ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover filter contrast-110 brightness-90"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-radial from-zinc-900/40 via-zinc-950 to-black">
          <div className="text-center space-y-2 pointer-events-none">
            <Eye className="w-12 h-12 text-cyan-500/20 mx-auto animate-pulse" />
            <p className="text-xs font-mono text-zinc-600 uppercase tracking-widest">
              {active
                ? 'OPTICAL SENSOR STREAM ONLINE // RUNNING SIMULATION'
                : 'SURVEILLANCE SENSOR IN STANDBY'}
            </p>
          </div>
        </div>
      )}

      {/* Cyber gradient vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/80 z-10 pointer-events-none" />

      {/* Cyber tactical scanning grid */}
      <div
        className="absolute inset-0 opacity-[0.04] z-10 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, #06b6d4 1px, transparent 1px), linear-gradient(to bottom, #06b6d4 1px, transparent 1px)`,
          backgroundSize: '36px 36px',
        }}
      />

      {/* Sweeping scanline */}
      {active && (
        <motion.div
          className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent z-20 pointer-events-none shadow-[0_0_15px_rgba(6,182,212,0.8)]"
          animate={{ top: ['0%', '100%', '0%'] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        />
      )}

      {/* Tactical Center Target Crosshairs */}
      <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
        <div className="relative w-32 h-32 border border-white/10 rounded-full flex items-center justify-center">
          <Crosshair className="w-10 h-10 text-cyan-500/30" />
          <div className="absolute -top-2 w-4 h-0.5 bg-cyan-400/40" />
          <div className="absolute -bottom-2 w-4 h-0.5 bg-cyan-400/40" />
          <div className="absolute -left-2 w-0.5 h-4 bg-cyan-400/40" />
          <div className="absolute -right-2 w-0.5 h-4 bg-cyan-400/40" />
        </div>
      </div>

      {/* Dynamic Anomaly Bounding Box */}
      {active && isAnomaly && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute top-1/4 left-1/3 w-1/3 h-1/2 border-2 border-rose-500 rounded-lg z-20 shadow-[0_0_20px_rgba(244,63,94,0.6)] flex flex-col justify-between p-2 pointer-events-none"
        >
          <div className="flex items-center justify-between">
            <span className="px-1.5 py-0.5 bg-rose-500 text-white font-mono text-[10px] font-bold rounded">
              {currentPrediction.toUpperCase()} [
              {(currentConfidence * 100).toFixed(0)}%]
            </span>
            <AlertTriangle className="w-4 h-4 text-rose-400 animate-bounce" />
          </div>
          <div className="text-[9px] font-mono text-rose-300 bg-black/70 px-1 rounded self-start">
            TRACK_ID: #TG-884 // CONVLSTM
          </div>
        </motion.div>
      )}

      {/* HUD Top Bar */}
      <div className="absolute top-4 inset-x-4 z-20 flex items-center justify-between font-mono text-xs">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/70 backdrop-blur-md border border-white/10">
          <Camera className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-white font-bold">{cameraName}</span>
          {hasWebcam && (
            <span className="text-[9px] px-1.5 py-0.5 bg-cyan-500/20 text-cyan-300 rounded border border-cyan-500/40">
              WEBCAM DIRECT
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {active ? (
            <Badge variant={isAnomaly ? 'danger' : 'success'} size="md" pulse>
              <Radio className="w-3 h-3" />
              {isAnomaly ? 'ANOMALY DETECTED' : 'MONITORING LIVE'}
            </Badge>
          ) : (
            <Badge variant="default" size="md">
              FEED STANDBY
            </Badge>
          )}
        </div>
      </div>

      {/* HUD Bottom Bar */}
      <div className="absolute bottom-4 inset-x-4 z-20 flex items-center justify-between font-mono text-xs">
        <div className="px-3 py-1.5 rounded-lg bg-black/70 backdrop-blur-md border border-white/10 text-zinc-400">
          {timestamp}
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/70 backdrop-blur-md border border-white/10">
          <span className="text-zinc-400">FPS:</span>
          <span className="text-emerald-400 font-bold">29.97</span>
          <span className="text-zinc-400 ml-2">RES:</span>
          <span className="text-cyan-400 font-bold">1080p</span>
        </div>
      </div>
    </div>
  );
}
