
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface ValidationFormHeaderProps {
  leadName: string;
  error?: string | null;
  hasTranscript: boolean;
}

export const ValidationFormHeader: React.FC<ValidationFormHeaderProps> = ({
  leadName,
  error,
  hasTranscript
}) => {
  return (
    <div className="space-y-2">
      <h3 className="text-lg font-medium">Validación de Custodio: {leadName}</h3>
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4 mr-2" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {!hasTranscript && (
        <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded-md">
          No se encontró transcripción de llamada para este custodio. Se recomienda realizar una llamada antes de validar.
        </div>
      )}
    </div>
  );
};
