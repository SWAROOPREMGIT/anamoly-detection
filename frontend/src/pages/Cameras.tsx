import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  Plus,
  Trash2,
  RefreshCw,
  Video,
  Radio,
  X,
} from 'lucide-react';
import PageTransition from '../components/layout/PageTransition';
import EmptyState from '../components/common/EmptyState';
import Badge from '../components/common/Badge';
import { useApi } from '../hooks/useApi';
import client from '../api/client';

interface CameraItem {
  id: string;
  name: string;
  url: string;
  type: string;
  status: string;
  created_at: string;
  last_checked?: string;
}

export default function Cameras() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [checkingId, setCheckingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [url, setUrl] = useState('0');
  const [type, setType] = useState('webcam');
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Fetch camera list
  const { data, loading, refetch } = useApi<{
    cameras: CameraItem[];
    total: number;
  }>('/api/cameras/');

  const cameras = data?.cameras || [];

  const handleAddCamera = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !url) return;

    setFormSubmitting(true);
    try {
      await client.post('/api/cameras/', { name, url, type });
      setName('');
      setUrl('0');
      setType('webcam');
      setShowAddModal(false);
      refetch();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to register camera';
      alert(msg);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleCheckStatus = async (id: string) => {
    setCheckingId(id);
    try {
      await client.get(`/api/cameras/${id}/status`);
      refetch();
    } catch {
      // Failed check
    } finally {
      setCheckingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this camera sensor configuration?')) {
      setDeletingId(id);
      try {
        await client.delete(`/api/cameras/${id}`);
        refetch();
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Camera className="w-5 h-5 text-cyan-400" />
              <h2 className="text-xl font-bold tracking-tight text-white font-mono">
                SURVEILLANCE SENSOR FLEET
              </h2>
            </div>
            <p className="text-xs text-zinc-400 font-mono">
              Configure CCTV nodes, IP network cameras, and direct USB optical
              devices.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-mono text-xs font-semibold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Register Optical Feed</span>
          </button>
        </div>

        {/* Camera Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-48 rounded-2xl bg-zinc-900/40 border border-white/[0.04] animate-pulse"
              />
            ))}
          </div>
        ) : cameras.length === 0 ? (
          <EmptyState
            icon={<Camera className="w-8 h-8 text-zinc-400" />}
            title="No Surveillance Cameras Configured"
            description="Add your first local webcam or network RTSP stream to begin continuous anomaly monitoring."
            action={
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono text-xs font-semibold hover:bg-cyan-500/30 transition-colors"
              >
                Add Camera Now
              </button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {cameras.map((cam) => {
                const isConnected = cam.status === 'connected';
                return (
                  <motion.div
                    key={cam.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-5 rounded-2xl bg-zinc-950/60 border border-white/[0.06] backdrop-blur-xl flex flex-col justify-between hover:border-white/10 transition-all shadow-lg"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-xl bg-zinc-900 border border-white/5 text-cyan-400">
                            {cam.type === 'rtsp' ? (
                              <Radio className="w-4 h-4" />
                            ) : (
                              <Video className="w-4 h-4" />
                            )}
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-white tracking-wide truncate max-w-[160px]">
                              {cam.name}
                            </h4>
                            <span className="text-[10px] font-mono text-zinc-400 uppercase">
                              Type: {cam.type}
                            </span>
                          </div>
                        </div>

                        <Badge
                          variant={isConnected ? 'success' : 'default'}
                          size="sm"
                          pulse={isConnected}
                        >
                          {isConnected ? 'ONLINE' : 'OFFLINE'}
                        </Badge>
                      </div>

                      <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-white/[0.02] font-mono text-xs text-zinc-300 break-all mb-4">
                        <span className="text-zinc-400 block text-[10px] uppercase">
                          Source Endpoint
                        </span>
                        {cam.url}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-white/[0.04]">
                      <button
                        onClick={() => handleCheckStatus(cam.id)}
                        disabled={checkingId === cam.id}
                        className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white font-mono text-xs flex items-center gap-1.5 transition-colors"
                      >
                        <RefreshCw
                          className={`w-3.5 h-3.5 ${
                            checkingId === cam.id ? 'animate-spin' : ''
                          }`}
                        />
                        <span>Check Status</span>
                      </button>

                      <button
                        onClick={() => handleDelete(cam.id)}
                        disabled={deletingId === cam.id}
                        aria-label={`Delete camera ${cam.name}`}
                        className="p-1.5 rounded-lg bg-zinc-900/80 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Modal: Add Camera */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-md p-6 rounded-3xl bg-zinc-950 border border-white/10 shadow-2xl relative"
            >
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                <h3 className="text-base font-bold text-white font-mono">
                  REGISTER NEW OPTICAL FEED
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddCamera} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-zinc-300 uppercase mb-1.5">
                    Camera Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Gate 4 West Corridor"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-zinc-300 uppercase mb-1.5">
                    Source Endpoint (Webcam index or RTSP URL)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="0 or rtsp://192.168.1.100:554/live"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-zinc-300 uppercase mb-1.5">
                    Stream Protocol / Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
                  >
                    <option value="webcam">Local USB / Integrated Webcam</option>
                    <option value="rtsp">RTSP Network Stream</option>
                    <option value="ip">IP Camera Feed</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-mono text-xs transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-mono text-xs font-bold transition-all"
                  >
                    {formSubmitting ? 'Registering...' : 'Save Camera'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
