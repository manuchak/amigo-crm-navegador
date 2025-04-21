
import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { ValidationFormData } from '../types';

interface ValidationNotesProps {
  formData: ValidationFormData;
  onInputChange: (name: keyof ValidationFormData, value: any) => void;
}

export const ValidationNotes: React.FC<ValidationNotesProps> = ({
  formData,
  onInputChange
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Notas Adicionales</label>
        <Textarea
          placeholder="Observaciones sobre el custodio..."
          value={formData.additional_notes}
          onChange={(e) => onInputChange("additional_notes", e.target.value)}
          rows={3}
        />
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Razón de Rechazo (si aplica)</label>
        <Textarea
          placeholder="Razón por la cual el custodio no cumple con los requisitos..."
          value={formData.rejection_reason}
          onChange={(e) => onInputChange("rejection_reason", e.target.value)}
          rows={2}
        />
      </div>
    </div>
  );
};
