import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  Flame,
  UserX,
  Activity,
  CheckCircle,
  Trash2,
  Clock,
  Video,
} from 'lucide-react';
import Badge from '../common/Badge';
import { formatTimestamp, formatConfidence } from '../../utils/formatters';

export interface AlertItem {
  id: string;
  detection_id?: string;
  type?: string;
  severity: 'high' | 'medium' | 'low';
  confidence: number;
  filename?: string;
  message?: string;
  acknowledged?: boolean;
  acknowledged_at?: string;
  timestamp: string;
}

interface AlertCardProps {
  alert: AlertItem;
  onAcknowledge: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function AlertCard({ alert, onAcknowledge, onDelete }: AlertCardProps) {
  const [loadingAck, setLoadingAck] = useState(false);
  const [loadingDel, setLoadingDel] = useState(false);

  const getAlertIcon = (type = '') => {
    switch (type.toLowerCase()) {
      case 'fight':
        return <Flame className="w-5 h-5 text-rose-400" />;
      case 'intrusion':
        return <UserX className="w-5 h-5 text-purple-400" />;
      case 'fall':
        return <Activity className="w-5 h-5 text-amber-400" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-rose-400" />;
    }
  };

  const handleAck = async () => {
    setLoadingAck(true);
    try {
      await onAcknowledge(alert.id);
    } finally {
      setLoadingAck(false);
    }
  };

  const handleDel = async () => {
    if (confirm('Delete this alert record?')) {
      setLoadingDel(true);
      try {
        await onDelete(alert.id);
      } finally {
        setLoadingDel(false);
      }
    }
  };

  const severityBadge =
    alert.severity === 'high'
      ? 'danger'
      : alert.severity === 'medium'
      ? 'warning'
      : 'info';

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`rounded-2xl border p-5 transition-all duration-300 backdrop-blur-xl relative overflow-hidden ${
        alert.acknowledged
          ? 'bg-zinc-950/40 border-white/[0.04] opacity-75'
          : alert.severity === 'high'
          ? 'bg-rose-950/20 border-rose-500/30 shadow-[0_0_20px_rgba(244,63,94,0.1)]'
          : 'bg-amber-950/20 border-amber-500/30'
      }`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Left: icon and event info */}
        <div className="flex items-start sm:items-center gap-3.5">
          <div
            className={`p-3 rounded-xl border shrink-0 ${
              alert.severity === 'high'
                ? 'bg-rose-500/10 border-rose-500/30'
                : 'bg-amber-500/10 border-amber-500/30'
            }`}
          >
            {getAlertIcon(alert.type)}
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm font-semibold text-white tracking-wide">
                {alert.type || 'Security Anomaly'}
              </h4>
              <Badge variant={severityBadge} size="sm" pulse={!alert.acknowledged}>
                {alert.severity.toUpperCase()} PRIORITY
              </Badge>
              {alert.acknowledged && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-white/5">
                  ACKNOWLEDGED
                </span>
              )}
            </div>

            <p className="text-xs text-zinc-300 mt-1">{alert.message}</p>

            <div className="flex items-center gap-3 mt-2 text-xs font-mono text-zinc-400 flex-wrap">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-cyan-400" />
                {formatTimestamp(alert.timestamp)}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Video className="w-3 h-3 text-purple-400" />
                {alert.filename || 'Camera stream'}
              </span>
              <span>•</span>
              <span>
                Confidence:{' '}
                <span className="text-zinc-200 font-bold">
                  {formatConfidence(alert.confidence || 0)}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          {!alert.acknowledged && (
            <button
              onClick={handleAck}
              disabled={loadingAck}
              className="px-3.5 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 font-mono text-xs font-medium transition-all flex items-center gap-1.5 active:scale-95 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>{loadingAck ? 'Confirming...' : 'Acknowledge'}</span>
            </button>
          )}

          <button
            onClick={handleDel}
            disabled={loadingDel}
            title="Delete Alert"
            aria-label="Delete alert"
            className="p-2 rounded-xl bg-zinc-900/80 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 border border-white/5 transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

