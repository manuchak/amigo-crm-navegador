
export type ProgressCallback = (status: string, processed: number, total: number) => void;

export interface ImportResponse {
  success: boolean;
  message?: string;
  errors?: Array<{
    row?: number;
    batch?: number;
    message: string;
    details?: string;
  }>;
  error?: unknown;
  progressId?: string;
  insertedCount?: number;
  totalCount?: number;
}

export interface ImportProgress {
  id: string;
  status: 'validating' | 'importing' | 'completed' | 'completed_with_errors' | 'error';
  processed: number;
  total: number;
  message: string;
  created_at?: string;
  updated_at?: string;
}
