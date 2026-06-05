export interface PredictResponse {
  plaga: string;
  confianza: number;
  modelo: string;
  tiempo_inferencia: string;
  recomendacion: string;
}

export interface MetricItem {
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  auc_roc: number;
  log_loss: number;
}

export interface MetricsResponse {
  best_model: string;
  selected_metric: string;
  metrics: Record<string, MetricItem>;
  classes: string[];
  total_training_time_seconds: number;
  timestamp: string;
}

export interface PredictionHistoryItem {
  id: number;
  imagen_url: string;
  plaga_detectada: string;
  confianza: number;
  modelo_usado: string;
  tiempo_ejecucion: string;
  created_at: string;
}
