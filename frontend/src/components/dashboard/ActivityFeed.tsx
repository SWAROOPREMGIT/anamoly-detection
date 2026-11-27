import { motion } from 'framer-motion';
import { ShieldAlert, ShieldCheck, Film, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Badge from '../common/Badge';
import { formatRelativeTime, formatConfidence } from '../../utils/formatters';

interface ActivityItem {
  id?: string;
  filename?: string;
  class?: string;
  confidence?: number;
  timestamp?: string;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
  loading?: boolean;
}

export default function ActivityFeed({ activities, loading }: ActivityFeedProps) {
  if (loading) {
    return (
      <div className="space-y-3 p-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-16 rounded-xl bg-zinc-900/40 border border-white/[0.04] animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="p-8 text-center text-zinc-400 font-mono text-xs">
        <Film className="w-8 h-8 mx-auto mb-2 text-zinc-400 opacity-60" />
        NO SURVEILLANCE EVENTS RECORDED YET
      </div>
    );
  }

  return (
    <div className="divide-y divide-white/[0.04]">
      {activities.map((item, index) => {
        const isAnomaly = item.class && item.class !== 'Normal Activity';
        const badgeVariant =
          item.class === 'Fight' || item.class === 'Intrusion'
            ? 'danger'
            : item.class === 'Fall'
            ? 'warning'
            : 'success';

        return (
          <motion.div
            key={item.id || index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors group"
          >
            <div className="flex items-center gap-3.5">
              <div
                className={`p-2.5 rounded-xl border ${
                  isAnomaly
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                    : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                }`}
              >
                {isAnomaly ? (
                  <ShieldAlert className="w-4 h-4" />
                ) : (
                  <ShieldCheck className="w-4 h-4" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-zinc-200 tracking-wide">
                    {item.filename || 'Camera Capture'}
                  </span>
                  <Badge variant={badgeVariant} size="sm">
                    {item.class || 'Analyzing'}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 mt-1 text-xs font-mono text-zinc-400">
                  <span>{formatRelativeTime(item.timestamp || '')}</span>
                  <span>•</span>
                  <span>
                    Confidence:{' '}
                    <span className="text-zinc-300 font-medium">
                      {formatConfidence(item.confidence || 0)}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            <Link
              to="/detection"
              aria-label={`Inspect event ${item.filename || 'Capture'}`}
              className="opacity-0 group-hover:opacity-100 p-2 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white transition-all hover:scale-105"
            >
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
