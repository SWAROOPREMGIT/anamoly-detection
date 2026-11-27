import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Video,
  ShieldAlert,
  Camera,
  Bell,
  Scan,
  Radio,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import PageTransition from '../components/layout/PageTransition';
import NeuralNetwork from '../components/three/NeuralNetwork';
import StatCard from '../components/dashboard/StatCard';
import DetectionChart from '../components/dashboard/DetectionChart';
import ActivityFeed from '../components/dashboard/ActivityFeed';
import { useApi } from '../hooks/useApi';

export default function Dashboard() {
  // Fetch summary analytics
  const { data: summary, loading: summaryLoading } = useApi<{
    total_videos: number;
    total_anomalies: number;
    normal_count: number;
    detection_breakdown: Record<string, number>;
    recent_detections: Array<{
      id: string;
      filename: string;
      class: string;
      confidence: number;
      timestamp: string;
    }>;
    alert_stats: {
      total: number;
      unacknowledged: number;
      by_severity: { high: number; medium: number; low: number };
    };
  }>('/api/analytics/summary');

  // Fetch cameras
  const { data: cameraData } = useApi<{
    cameras: Array<{ id: string; name: string; status: string }>;
    total: number;
  }>('/api/cameras/');

  const totalVideos = summary?.total_videos ?? 0;
  const totalAnomalies = summary?.total_anomalies ?? 0;
  const totalCameras = cameraData?.total ?? 0;
  const unackAlerts = summary?.alert_stats?.unacknowledged ?? 0;

  return (
    <PageTransition>
      <div className="space-y-8">
        {/* Futuristic AI Command Center Hero Banner with 3D Neural Network */}
        <div className="relative rounded-3xl border border-white/[0.08] bg-gradient-to-br from-zinc-950/90 via-[#0d0d16]/90 to-zinc-950/90 backdrop-blur-2xl p-6 md:p-10 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          {/* Subtle ambient backlights */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 right-10 w-80 h-80 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Mission Brief & Actions */}
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>DEEP LEARNING OPTICAL DEFENSE MATRIX</span>
              </div>

              <div className="space-y-2">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
                  AUTONOMOUS{' '}
                  <span className="gradient-text-animated">VIOLENCE</span> &{' '}
                  <span className="text-cyan-400">ANOMALY</span> DETECTION
                </h1>
                <p className="text-sm sm:text-base text-zinc-400 max-w-xl font-normal leading-relaxed">
                  Real-time neural surveillance powered by spatio-temporal
                  ConvLSTM networks. Automated optical classification of normal
                  movement, physical violence, slip hazards, and unauthorized
                  intrusions.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  to="/detection"
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 text-white font-mono text-xs font-bold uppercase tracking-wider shadow-[0_0_25px_rgba(6,182,212,0.35)] transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                >
                  <Scan className="w-4 h-4" />
                  <span>Analyze Surveillance Video</span>
                </Link>

                <Link
                  to="/monitoring"
                  className="px-6 py-3 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-200 border border-white/10 font-mono text-xs font-medium uppercase tracking-wider transition-all hover:border-white/20 flex items-center gap-2"
                >
                  <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <span>Launch Live Feeds</span>
                </Link>
              </div>
            </div>

            {/* Right Column: 3D Animated Neural Network Canvas */}
            <div className="lg:col-span-5 relative h-72 sm:h-80 flex items-center justify-center">
              <NeuralNetwork />
            </div>
          </div>
        </div>

        {/* Analytical Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Surveillance Archive"
            value={totalVideos}
            suffix=" Videos"
            subtitle="Analyzed footage"
            icon={<Video className="w-5 h-5" />}
            glowColor="cyan"
            delay={0.05}
          />
          <StatCard
            title="Anomalies Flagged"
            value={totalAnomalies}
            suffix=" Events"
            subtitle="Security breaches"
            icon={<ShieldAlert className="w-5 h-5" />}
            glowColor="rose"
            delay={0.1}
          />
          <StatCard
            title="Connected Optical Fleet"
            value={totalCameras}
            suffix=" Feeds"
            subtitle="Sensors configured"
            icon={<Camera className="w-5 h-5" />}
            glowColor="emerald"
            delay={0.15}
          />
          <StatCard
            title="Actionable Alerts"
            value={unackAlerts}
            suffix=" Pending"
            subtitle="Require inspection"
            icon={<Bell className="w-5 h-5" />}
            glowColor="amber"
            delay={0.2}
          />
        </div>

        {/* Deep Analytical Matrix & Live Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Classification Distribution Chart */}
          <div className="lg:col-span-7 rounded-3xl bg-zinc-950/60 border border-white/[0.06] backdrop-blur-xl p-6 shadow-xl flex flex-col justify-between">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-white tracking-wide font-mono">
                  CLASSIFICATION BREAKDOWN
                </h3>
                <span className="text-xs text-zinc-400 font-mono">
                  Spatio-temporal distribution across 4 core classes
                </span>
              </div>
              <Link
                to="/analytics"
                className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
              >
                <span>Full Metrics</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <DetectionChart breakdown={summary?.detection_breakdown} />
          </div>

          {/* Recent Detections Activity Feed */}
          <div className="lg:col-span-5 rounded-3xl bg-zinc-950/60 border border-white/[0.06] backdrop-blur-xl p-6 shadow-xl flex flex-col">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.04]">
              <div>
                <h3 className="text-base font-bold text-white tracking-wide font-mono">
                  RECENT INCIDENTS
                </h3>
                <span className="text-xs text-zinc-400 font-mono">
                  Live detection log stream
                </span>
              </div>
              <Link
                to="/detection"
                className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="flex-1 overflow-hidden">
              <ActivityFeed
                activities={summary?.recent_detections || []}
                loading={summaryLoading}
              />
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

