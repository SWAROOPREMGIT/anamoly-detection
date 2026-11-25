import { useState, useRef } from 'react';
import type { DragEvent, ChangeEvent } from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, FileVideo, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { SUPPORTED_VIDEO_FORMATS } from '../../utils/constants';

interface VideoUploaderProps {
  onUpload: (file: File) => Promise<void>;
  isUploading: boolean;
  uploadProgress?: number;
}

export default function VideoUploader({
  onUpload,
  isUploading,
  uploadProgress = 0,
}: VideoUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const validateAndSetFile = (file: File) => {
    setErrorMsg(null);
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!SUPPORTED_VIDEO_FORMATS.includes(ext)) {
      setErrorMsg(
        `Unsupported video format (${ext}). Allowed: ${SUPPORTED_VIDEO_FORMATS.join(', ')}`
      );
      return;
    }
    // Max 500 MB
    if (file.size > 500 * 1024 * 1024) {
      setErrorMsg('File size exceeds the 500 MB limit.');
      return;
    }
    setSelectedFile(file);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleStartAnalysis = async () => {
    if (!selectedFile) return;
    try {
      await onUpload(selectedFile);
      setSelectedFile(null);
    } catch {
      // Error handled by caller
    }
  };

  return (
    <div className="w-full">
      {/* Drag & Drop Dropzone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-8 md:p-12 text-center transition-all duration-300 backdrop-blur-xl ${
          isDragOver
            ? 'border-cyan-400 bg-cyan-950/20 shadow-[0_0_30px_rgba(6,182,212,0.2)]'
            : 'border-white/10 hover:border-white/20 bg-zinc-950/40 hover:bg-zinc-950/60'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={SUPPORTED_VIDEO_FORMATS.join(',')}
          className="hidden"
          onChange={handleFileChange}
          disabled={isUploading}
        />

        <div className="flex flex-col items-center justify-center max-w-md mx-auto">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-300 ${
              isDragOver
                ? 'scale-110 bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                : 'bg-zinc-900/80 text-zinc-400 border border-white/5'
            }`}
          >
            <UploadCloud className="w-8 h-8" />
          </div>

          <h3 className="text-base font-semibold text-zinc-100 mb-1 tracking-wide">
            Drag & drop surveillance footage or{' '}
            <span className="text-cyan-400 hover:underline">browse</span>
          </h3>

          <p className="text-xs text-zinc-400 font-mono mb-4">
            Supports MP4, AVI, MKV, MOV (Up to 500 MB)
          </p>

          <div className="flex flex-wrap items-center justify-center gap-1.5">
            {SUPPORTED_VIDEO_FORMATS.map((fmt) => (
              <span
                key={fmt}
                className="px-2 py-0.5 rounded text-[10px] font-mono text-zinc-400 bg-zinc-900/60 border border-white/5"
              >
                {fmt}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Error notification */}
      {errorMsg && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2.5 text-xs text-rose-300 font-mono"
        >
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </motion.div>
      )}

      {/* Selected File Status & Action Bar */}
      {selectedFile && !isUploading && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 rounded-xl bg-zinc-900/80 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-md"
        >
          <div className="flex items-center gap-3 overflow-hidden w-full">
            <div className="p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shrink-0">
              <FileVideo className="w-5 h-5" />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-white truncate">
                {selectedFile.name}
              </p>
              <p className="text-xs font-mono text-zinc-400">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for
                ConvLSTM inference
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            <button
              onClick={() => setSelectedFile(null)}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-mono transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleStartAnalysis}
              className="flex-1 sm:flex-none px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-mono text-xs font-semibold shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Run AI Detection
            </button>
          </div>
        </motion.div>
      )}

      {/* Uploading & Inference in progress */}
      {isUploading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 p-5 rounded-xl bg-zinc-950/80 border border-cyan-500/30 backdrop-blur-xl shadow-[0_0_25px_rgba(6,182,212,0.15)]"
        >
          <div className="flex items-center justify-between mb-3 font-mono text-xs">
            <span className="flex items-center gap-2 text-cyan-300">
              <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
              PROCESSING VIDEO FRAMES & RUNNING CONVLSTM INFERENCE...
            </span>
            <span className="text-zinc-400">{uploadProgress || 65}%</span>
          </div>

          <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
            <motion.div
              className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 h-1.5 rounded-full"
              initial={{ width: '10%' }}
              animate={{ width: `${uploadProgress || 85}%` }}
              transition={{ duration: 1.2, ease: 'easeInOut' }}
            />
          </div>
        </motion.div>
      )}
    </div>
  );
}
