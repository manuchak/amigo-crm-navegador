
export type ProgressCallback = (status: string, processed: number, total: number) => void;

export interface ImportResponse {
  success: boolean;
  message?: string;
  errors?: Array<{
    row: number;
    message: string;
  }>;
  error?: unknown;
}
