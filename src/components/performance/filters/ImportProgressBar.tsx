
import React from 'react';
import { Progress } from "@/components/ui/progress";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  
  // Check if the progress is stuck at a low percentage for warning
  const isStuck = isUploading && uploadProgress > 0 && uploadProgress < 15;
  
  return (
    <div className="mt-4">
      <div className="flex justify-between text-xs text-muted-foreground mb-1">
        <span>{importStatus}</span>
        <span>{uploadProgress}%</span>
      </div>
      <Progress value={uploadProgress} className="h-2" />
      
      {/* Warning message if stuck at connection verification */}
      {isStuck && (
        <div className="flex items-center gap-2 text-amber-500 text-xs mt-2">
          <AlertTriangle className="h-4 w-4" />
          <span>
            La conexión está tardando más de lo esperado. Los archivos grandes pueden tardar varios minutos.
          </span>
        </div>
      )}
      
      {totalRows > 0 && (
        <div className="text-xs text-muted-foreground mt-1 flex justify-between">
          <span>Procesando {processedRows} de {totalRows} registros</span>
          {isUploading && (
            <Button 
              onClick={onCancel}
              variant="destructive"
              size="sm"
              className="text-xs h-6 px-2 py-0"
            >
              Cancelar importación
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
