import { useState, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Scan, Search, Sparkles } from 'lucide-react';
import PageTransition from '../components/layout/PageTransition';
import VideoUploader from '../components/detection/VideoUploader';
import ResultCard from '../components/detection/ResultCard';
import EmptyState from '../components/common/EmptyState';
import { useApi } from '../hooks/useApi';
import client from '../api/client';

interface ResultData {
  id: string;
  filename: string;
  status: string;
  dominant_class?: string;
  dominant_confidence?: number;
  predictions?: Array<{ class: string; confidence: number }>;
  timestamp: string;
  duration?: number;
  frames_analyzed?: number;
  sequences_analyzed?: number;
  alert_id?: string;
  model_loaded?: boolean;
}

export default function Detection() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [filterClass, setFilterClass] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [latestResult, setLatestResult] = useState<ResultData | null>(null);

  // Fetch past results
  const { data, loading, refetch } = useApi<{
    results: ResultData[];
    total: number;
  }>('/api/detection/results');

  const results = data?.results || [];

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(15);

    const formData = new FormData();
    formData.append('video', file);

    try {
      setUploadProgress(45);
      const response = await client.post<ResultData>(
        '/api/detection/upload',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const p = Math.round(
                (progressEvent.loaded * 70) / progressEvent.total
              );
              setUploadProgress(Math.max(15, p));
            }
          },
        }
      );

      setUploadProgress(100);
      setLatestResult(response.data);
      refetch();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Analysis failed';
      alert(`Detection Error: ${msg}`);
      throw err;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (id: string) => {
    await client.delete(`/api/detection/results/${id}`);
    if (latestResult?.id === id) {
      setLatestResult(null);
    }
    refetch();
  };

  const filteredResults = useMemo(() => {
    return results.filter((r) => {
      const matchesClass =
        filterClass === 'ALL' || r.dominant_class === filterClass;
      const matchesQuery =
        !searchQuery ||
        r.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.dominant_class &&
          r.dominant_class.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesClass && matchesQuery;
    });
  }, [results, filterClass, searchQuery]);

  return (
    <PageTransition>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Scan className="w-5 h-5 text-cyan-400" />
              <h2 className="text-xl font-bold tracking-tight text-white font-mono">
                AI VIDEO INFERENCE ENGINE
              </h2>
            </div>
            <p className="text-xs text-zinc-400 font-mono">
              Upload CCTV recordings to perform deep spatio-temporal ConvLSTM
              classification.
            </p>
          </div>
        </div>

        {/* Video Upload Section */}
        <div className="p-6 rounded-3xl bg-zinc-950/60 border border-white/[0.06] backdrop-blur-xl shadow-xl">
          <VideoUploader
            onUpload={handleUpload}
            isUploading={isUploading}
            uploadProgress={uploadProgress}
          />
        </div>

        {/* Prominent Latest Result View */}
        {latestResult && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-mono uppercase tracking-widest text-cyan-300 font-bold">
                LATEST INFERENCE REPORT
              </h3>
            </div>
            <ResultCard result={latestResult} onDelete={handleDelete} />
          </div>
        )}

        {/* History & Archive Section */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
            <div>
              <h3 className="text-base font-bold text-white font-mono tracking-wide">
                DETECTION ARCHIVE
              </h3>
              <span className="text-xs text-zinc-400 font-mono">
                {filteredResults.length} of {results.length} records matched
              </span>
            </div>

            {/* Filter Pills & Search */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search filename..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-xl bg-zinc-900 border border-white/10 text-xs font-mono text-white placeholder-zinc-400 focus:outline-none focus:border-cyan-500 w-44"
                />
              </div>

              <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-900 border border-white/5 text-xs font-mono">
                {['ALL', 'Normal Activity', 'Fight', 'Fall', 'Intrusion'].map(
                  (cls) => (
                    <button
                      key={cls}
                      onClick={() => setFilterClass(cls)}
                      className={`px-2.5 py-1 rounded-lg transition-all ${
                        filterClass === cls
                          ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      {cls}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Results Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-44 rounded-2xl bg-zinc-900/40 border border-white/[0.04] animate-pulse"
                />
              ))}
            </div>
          ) : filteredResults.length === 0 ? (
            <EmptyState
              icon={<Scan className="w-8 h-8 text-zinc-400" />}
              title="No Detection Records Found"
              description="Upload a video above to initiate ConvLSTM anomaly and violence detection."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AnimatePresence>
                {filteredResults.map((res) => (
                  <ResultCard
                    key={res.id}
                    result={res}
                    onDelete={handleDelete}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}

