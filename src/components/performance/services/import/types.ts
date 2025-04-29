
export interface ImportResponse {
  success: boolean;
  message: string;
  progressId?: string;
  insertedCount?: number;
  totalCount?: number;
  errors?: Array<{
    row?: number;
    batch?: number;
    message: string;
    details?: string;
  }>;
}

export type ProgressCallback = (
  status: string,
  processedRows: number,
  totalRows: number
) => void;
