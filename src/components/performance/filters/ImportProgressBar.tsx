
import React from 'react';
import { Progress } from "@/components/ui/progress";

interface ImportProgressBarProps {
  importStatus: string;
  uploadProgress: number;
  totalRows: number;
  processedRows: number;
  isUploading: boolean;
  onCancel: () => void;
}

export function ImportProgressBar({
  importStatus,
  uploadProgress,
  totalRows,
  processedRows,
  isUploading,
  onCancel
}: ImportProgressBarProps) {
  if (uploadProgress === 0) return null;
  
  return (
    <div className="mt-4">
      <div className="flex justify-between text-xs text-muted-foreground mb-1">
        <span>{importStatus}</span>
        <span>{uploadProgress}%</span>
      </div>
      <Progress value={uploadProgress} className="h-2" />
      
      {totalRows > 0 && (
        <div className="text-xs text-muted-foreground mt-1 flex justify-between">
          <span>Procesando {processedRows} de {totalRows} registros</span>
          {isUploading && (
            <button 
              onClick={onCancel}
              className="text-xs text-red-500 hover:text-red-700"
            >
              Cancelar importación
            </button>
          )}
        </div>
      )}
    </div>
  );
}
