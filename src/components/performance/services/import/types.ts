
export type ProgressCallback = (status: string, processed: number, total: number) => void;

export interface ImportResponse {
  success: boolean;
  message?: string;
  errors?: Array<{
    row: number;
    message: string;
  }>;
  error?: unknown;
  progressId?: string;
}

export interface ImportProgress {
  id: string;
  status: 'validating' | 'importing' | 'completed' | 'error';
  processed: number;
  total: number;
  message: string;
}
