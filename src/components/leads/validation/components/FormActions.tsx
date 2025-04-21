
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Save } from 'lucide-react';

interface FormActionsProps {
  loading: boolean;
  isFormValid: boolean;
  isCriticalRequirementsMissing: boolean;
}

export const FormActions: React.FC<FormActionsProps> = ({
  loading,
  isFormValid,
  isCriticalRequirementsMissing
}) => {
  return (
    <div>
      <div className="flex justify-end space-x-2">
        <Button type="submit" disabled={loading || !isFormValid}>
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
