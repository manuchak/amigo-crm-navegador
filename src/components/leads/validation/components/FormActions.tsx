
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Save } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface FormActionsProps {
  loading: boolean;
  isFormValid: boolean;
  isCriticalRequirementsMissing: boolean;
  authError?: string | null;
}

export const FormActions: React.FC<FormActionsProps> = ({
  loading,
  isFormValid,
  isCriticalRequirementsMissing,
  authError
}) => {
  return (
    <div className="space-y-4">
      {authError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{authError}</AlertDescription>
        </Alert>
      )}
      
      <div className="flex justify-end space-x-2">
        <Button type="submit" disabled={loading || !isFormValid || !!authError}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Guardar Validación
        </Button>
      </div>
      
      {isCriticalRequirementsMissing && (
        <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded-md mt-4">
          Por favor completa todos los requisitos críticos antes de guardar.
        </div>
      )}
    </div>
  );
};
