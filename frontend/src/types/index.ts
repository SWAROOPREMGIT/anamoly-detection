/* ─── Detection ─── */
export interface DetectionResult {
  id: string;
  video_name: string;
  predicted_class: string;
  confidence: number;
  severity: 'high' | 'medium' | 'low';
  timestamp: string;
  frames_analyzed: number;
  processing_time: number;
  video_path?: string;
  thumbnail?: string;
}

/* ─── Alerts ─── */
export interface Alert {
  id: string;
  detection_id: string;
  severity: 'high' | 'medium' | 'low';
  detection_class: string;
  confidence: number;
  video_name: string;
  timestamp: string;
  acknowledged: boolean;
  message: string;
}

export interface AlertStats {
  total: number;
  unacknowledged: number;
  high: number;
  medium: number;
  low: number;
}

/* ─── Analytics ─── */
export interface AnalyticsSummary {
  total_videos: number;
  total_anomalies: number;
  detection_rate: number;
  class_distribution: Record<string, number>;
  avg_confidence: number;
}

export interface TimelineEntry {
  date: string;
  count: number;
  anomalies: number;
}

export interface ModelInfo {
  name: string;
  architecture: string;
  input_shape: string;
  classes: string[];
  status: string;
  version: string;
}

export interface PerformanceMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  inference_time: number;
}

/* ─── Camera ─── */
export interface Camera {
  id: string;
  name: string;
  source_url: string;
  type: 'ip' | 'usb' | 'rtsp' | 'file';
  status: 'online' | 'offline' | 'unknown';
  created_at: string;
}

/* ─── Live Monitoring ─── */
export interface LiveStatus {
  active: boolean;
  camera_id: string | null;
  start_time: string | null;
  frames_processed: number;
  current_prediction: string | null;
  current_confidence: number | null;
}

export interface LiveDetectionEvent {
  timestamp: string;
  prediction: string;
  confidence: number;
  frame: number;
}

/* ─── System ─── */
export interface SystemStatus {
  status: string;
  model_loaded: boolean;
  gpu_available: boolean;
  uptime: number;
  version: string;
}

export interface SystemHealth {
  status: string;
  timestamp: string;
}

/* ─── API Response Wrapper ─── */
export interface ApiResponse<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/* ─── Navigation ─── */
export interface NavItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
}
