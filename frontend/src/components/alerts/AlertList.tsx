import { AnimatePresence } from 'framer-motion';
import AlertCard from './AlertCard';
import type { AlertItem } from './AlertCard';
import EmptyState from '../common/EmptyState';
import { ShieldCheck } from 'lucide-react';

interface AlertListProps {
  alerts: AlertItem[];
  onAcknowledge: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  loading?: boolean;
}

export default function AlertList({
  alerts,
  onAcknowledge,
  onDelete,
  loading,
}: AlertListProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-24 rounded-2xl bg-zinc-900/40 border border-white/[0.04] animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (!alerts || alerts.length === 0) {
    return (
      <EmptyState
        icon={<ShieldCheck className="w-8 h-8 text-emerald-400" />}
        title="All Surveillance Sectors Secure"
        description="No active or unacknowledged security anomalies detected. System operating under nominal surveillance parameters."
      />
    );
  }

  return (
    <div className="space-y-3">
      <AnimatePresence>
        {alerts.map((alert) => (
          <AlertCard
            key={alert.id}
            alert={alert}
            onAcknowledge={onAcknowledge}
            onDelete={onDelete}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

