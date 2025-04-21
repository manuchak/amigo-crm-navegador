
import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { ValidationFormData } from '../types';

interface ValidationNotesProps {
  formData: ValidationFormData;
  onInputChange: (name: keyof ValidationFormData, value: any) => void;
  disabled?: boolean;
}

export const ValidationNotes: React.FC<ValidationNotesProps> = ({ 
  formData, 
  onInputChange,
  disabled = false
}) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium block mb-2">Razón de rechazo (si aplica)</label>
        <Textarea
          placeholder="Ingrese la razón por la que el custodio no cumple con los requisitos..."
          value={formData.rejection_reason || ''}
          onChange={(e) => onInputChange('rejection_reason', e.target.value)}
          className="min-h-[80px] w-full"
          disabled={disabled}
        />
      </div>
      
      <div>
        <label className="text-sm font-medium block mb-2">Notas adicionales</label>
        <Textarea
          placeholder="Ingrese cualquier nota adicional sobre el custodio..."
          value={formData.additional_notes || ''}
          onChange={(e) => onInputChange('additional_notes', e.target.value)}
          className="min-h-[80px] w-full"
          disabled={disabled}
        />
      </div>
    </div>
  );
};
