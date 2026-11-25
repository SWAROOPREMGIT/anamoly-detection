import { useState, useMemo } from 'react';
import { Bell, ShieldAlert, CheckCircle, Flame, Filter } from 'lucide-react';
import PageTransition from '../components/layout/PageTransition';
import AlertList from '../components/alerts/AlertList';
import type { AlertItem } from '../components/alerts/AlertCard';
import { useApi } from '../hooks/useApi';
import client from '../api/client';

export default function Alerts() {
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'UNACK' | 'ACK'>('ALL');

  // Fetch alerts
  const { data, loading, refetch } = useApi<{
    alerts: AlertItem[];
    total: number;
  }>('/api/alerts/');

  // Fetch alert stats
  const { data: stats, refetch: refetchStats } = useApi<{
    total: number;
    acknowledged: number;
    unacknowledged: number;
    by_severity: { high: number; medium: number; low: number };
    by_type: Record<string, number>;
  }>('/api/alerts/stats');

  const alerts = data?.alerts || [];

  const handleAcknowledge = async (id: string) => {
    await client.put(`/api/alerts/${id}/acknowledge`);
    refetch();
    refetchStats();
  };

  const handleDelete = async (id: string) => {
    await client.delete(`/api/alerts/${id}`);
    refetch();
    refetchStats();
  };

  const filteredAlerts = useMemo(() => {
    return alerts.filter((a) => {
      const matchSev =
        filterSeverity === 'ALL' ||
        a.severity.toUpperCase() === filterSeverity;
      const matchStatus =
        filterStatus === 'ALL' ||
        (filterStatus === 'UNACK' && !a.acknowledged) ||
        (filterStatus === 'ACK' && a.acknowledged);
      return matchSev && matchStatus;
    });
  }, [alerts, filterSeverity, filterStatus]);

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Bell className="w-5 h-5 text-rose-400" />
            <h2 className="text-xl font-bold tracking-tight text-white font-mono">
              SECURITY INCIDENT & ALERT CONSOLE
            </h2>
          </div>
          <p className="text-xs text-zinc-400 font-mono">
            Automated event logs triggered by high-confidence violence and anomaly detections.
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-zinc-950/60 border border-white/[0.06] backdrop-blur-xl">
            <span className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">
              Total Incidents
            </span>
            <span className="text-2xl font-bold text-white font-mono">
              {stats?.total ?? alerts.length}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30 backdrop-blur-xl">
            <span className="text-[10px] font-mono uppercase text-rose-400 block mb-1 flex items-center gap-1">
              <Flame className="w-3 h-3" />
              High Severity
            </span>
            <span className="text-2xl font-bold text-rose-400 font-mono">
              {stats?.by_severity?.high ?? 0}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 backdrop-blur-xl">
            <span className="text-[10px] font-mono uppercase text-amber-400 block mb-1 flex items-center gap-1">
              <ShieldAlert className="w-3 h-3" />
              Pending Review
            </span>
            <span className="text-2xl font-bold text-amber-400 font-mono">
              {stats?.unacknowledged ?? 0}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 backdrop-blur-xl">
            <span className="text-[10px] font-mono uppercase text-emerald-400 block mb-1 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Acknowledged
            </span>
            <span className="text-2xl font-bold text-emerald-400 font-mono">
              {stats?.acknowledged ?? 0}
            </span>
          </div>
        </div>

        {/* Filters and List */}
        <div className="p-6 rounded-3xl bg-zinc-950/60 border border-white/[0.06] backdrop-blur-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.04]">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-mono uppercase text-zinc-300 font-semibold tracking-wider">
                Filter Dispatch Queue
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Status Filter */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-900 border border-white/5 text-xs font-mono">
                {(['ALL', 'UNACK', 'ACK'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setFilterStatus(st)}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      filterStatus === st
                        ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {st === 'ALL' ? 'All Status' : st === 'UNACK' ? 'Pending' : 'Resolved'}
                  </button>
                ))}
              </div>

              {/* Severity Filter */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-900 border border-white/5 text-xs font-mono">
                {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map((sev) => (
                  <button
                    key={sev}
                    onClick={() => setFilterSeverity(sev)}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      filterSeverity === sev
                        ? 'bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <AlertList
            alerts={filteredAlerts}
            onAcknowledge={handleAcknowledge}
            onDelete={handleDelete}
            loading={loading}
          />
        </div>
      </div>
    </PageTransition>
  );
}

