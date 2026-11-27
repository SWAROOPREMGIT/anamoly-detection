import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldAlert,
  ShieldCheck,
  Clock,
  Layers,
  Cpu,
  Trash2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Play,
  Film,
} from 'lucide-react';
import Badge from '../common/Badge';
import {
  formatTimestamp,
  formatConfidence,
  formatDuration,
} from '../../utils/formatters';

interface PredictionBreakdown {
  class: string;
  confidence: number;
}

interface ResultData {
  id: string;
  filename: string;
  video_url?: string;
  status: string;
  dominant_class?: string;
  dominant_confidence?: number;
  predictions?: PredictionBreakdown[];
  timestamp: string;
  duration?: number;
  frames_analyzed?: number;
  sequences_analyzed?: number;
  alert_id?: string;
  model_loaded?: boolean;
}

interface ResultCardProps {
  result: ResultData;
  onDelete?: (id: string) => Promise<void>;
}

export default function ResultCard({ result, onDelete }: ResultCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const dominant = result.dominant_class || 'Normal Activity';
  const confidence = result.dominant_confidence || 0;
  const isAnomaly = dominant !== 'Normal Activity';

  const badgeVariant =
    dominant === 'Fight' || dominant === 'Intrusion'
      ? 'danger'
      : dominant === 'Fall'
      ? 'warning'
      : 'success';

  const handleDelete = async () => {
    if (!onDelete) return;
    if (confirm('Delete this surveillance detection report?')) {
      setDeleting(true);
      try {
        await onDelete(result.id);
      } finally {
        setDeleting(false);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`rounded-2xl border transition-all duration-300 backdrop-blur-xl overflow-hidden ${
        isAnomaly
          ? 'bg-rose-950/20 border-rose-500/20 hover:border-rose-500/40 shadow-[0_0_20px_rgba(244,63,94,0.08)]'
          : 'bg-zinc-950/50 border-white/[0.06] hover:border-white/[0.12]'
      }`}
    >
      {/* Top Banner / Summary */}
      <div className="p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div
              className={`p-3 rounded-xl border ${
                isAnomaly
                  ? 'bg-rose-500/15 border-rose-500/30 text-rose-400'
                  : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
              }`}
            >
              {isAnomaly ? (
                <ShieldAlert className="w-5 h-5" />
              ) : (
                <ShieldCheck className="w-5 h-5" />
              )}
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white tracking-wide truncate max-w-xs sm:max-w-md">
                {result.filename}
              </h4>
              <span className="text-xs font-mono text-zinc-400">
                {formatTimestamp(result.timestamp)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant={badgeVariant} size="md" pulse={isAnomaly}>
              {dominant}
            </Badge>

            {result.video_url && (
              <button
                onClick={() => setShowVideo(!showVideo)}
                title="Inspect Video Footage"
                aria-label="Inspect video footage"
                className={`p-1.5 rounded-lg border transition-colors flex items-center gap-1 font-mono text-xs ${
                  showVideo
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                    : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white border-white/5'
                }`}
              >
                <Film className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Footage</span>
              </button>
            )}

            {onDelete && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                aria-label={`Delete detection result for ${result.filename}`}
                className="p-1.5 rounded-lg bg-zinc-900/80 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 border border-white/5 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Inline Video Player Preview */}
        {showVideo && result.video_url && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-4 rounded-xl overflow-hidden border border-white/10 bg-black aspect-video relative shadow-inner"
          >
            <video
              src={`http://localhost:5000${result.video_url}`}
              controls
              autoPlay
              className="w-full h-full object-contain"
            />
          </motion.div>
        )}

        {/* Primary Confidence Gauge */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs font-mono mb-1.5">
            <span className="text-zinc-400">Classification Confidence</span>
            <span
              className={`font-bold ${
                isAnomaly ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {formatConfidence(confidence)}
            </span>
          </div>
          <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden border border-white/5">
            <div
              className={`h-2 rounded-full transition-all duration-1000 ${
                isAnomaly
                  ? 'bg-gradient-to-r from-rose-500 to-amber-500'
                  : 'bg-gradient-to-r from-emerald-500 to-cyan-500'
              }`}
              style={{ width: `${Math.max(5, confidence * 100)}%` }}
            />
          </div>
        </div>

        {/* Metadata pill grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-white/[0.04] text-xs font-mono">
          <div className="p-2 rounded-lg bg-zinc-900/40 border border-white/[0.02]">
            <span className="text-[10px] text-zinc-400 block uppercase">
              Duration
            </span>
            <span className="text-zinc-200 font-semibold flex items-center gap-1 mt-0.5">
              <Clock className="w-3 h-3 text-cyan-400" />
              {result.duration ? formatDuration(result.duration) : '--'}
            </span>
          </div>

          <div className="p-2 rounded-lg bg-zinc-900/40 border border-white/[0.02]">
            <span className="text-[10px] text-zinc-400 block uppercase">
              Frames
            </span>
            <span className="text-zinc-200 font-semibold flex items-center gap-1 mt-0.5">
              <Layers className="w-3 h-3 text-purple-400" />
              {result.frames_analyzed ?? '--'} frames
            </span>
          </div>

          <div className="p-2 rounded-lg bg-zinc-900/40 border border-white/[0.02]">
            <span className="text-[10px] text-zinc-400 block uppercase">
              Sequences
            </span>
            <span className="text-zinc-200 font-semibold flex items-center gap-1 mt-0.5">
              <Cpu className="w-3 h-3 text-blue-400" />
              {result.sequences_analyzed ?? '--'}
            </span>
          </div>

          <div className="p-2 rounded-lg bg-zinc-900/40 border border-white/[0.02]">
            <span className="text-[10px] text-zinc-400 block uppercase">
              Alert Ref
            </span>
            <span className="text-zinc-200 font-semibold flex items-center gap-1 mt-0.5">
              <AlertTriangle
                className={`w-3 h-3 ${
                  result.alert_id ? 'text-amber-400' : 'text-zinc-400'
                }`}
              />
              {result.alert_id ? 'LOGGED' : 'NONE'}
            </span>
          </div>
        </div>

        {/* Probability Breakdown Accordion */}
        {result.predictions && result.predictions.length > 0 && (
          <div className="mt-3">
            <button
              onClick={() => setExpanded(!expanded)}
              className="w-full py-1 text-xs font-mono text-zinc-400 hover:text-zinc-200 flex items-center justify-center gap-1 transition-colors"
            >
              <span>{expanded ? 'Hide Probabilities' : 'View Class Probabilities'}</span>
              {expanded ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>

            {expanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-2 space-y-1.5 pt-2 border-t border-white/[0.04]"
              >
                {result.predictions.map((p) => (
                  <div
                    key={p.class}
                    className="flex items-center justify-between text-xs font-mono p-2 rounded-lg bg-zinc-900/60"
                  >
                    <span className="text-zinc-300">{p.class}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-cyan-400 h-1.5 rounded-full"
                          style={{ width: `${p.confidence * 100}%` }}
                        />
                      </div>
                      <span className="text-zinc-200 font-semibold w-12 text-right">
                        {(p.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
