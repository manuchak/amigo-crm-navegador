
import React from 'react';
import { RatingField } from './RatingField';
import { ValidationFormData } from '../types';

interface CallEvaluationProps {
  formData: ValidationFormData;
  onInputChange: (name: keyof ValidationFormData, value: any) => void;
  disabled?: boolean;
}

export const CallEvaluation: React.FC<CallEvaluationProps> = ({ 
  formData, 
  onInputChange,
  disabled = false
}) => {
  // Ensure consistent handling of null/undefined values
  const getValue = (field: keyof ValidationFormData) => {
    return formData[field] !== undefined ? formData[field] : null;
  };

  return (
    <div className="space-y-4" data-testid="call-evaluation">
      <h3 className="text-lg font-semibold">Evaluación de Llamada</h3>
      
      <div className="grid sm:grid-cols-3 gap-6">
        <RatingField 
          label="Calidad de la llamada" 
          name="call_quality_score"
          value={getValue('call_quality_score') as number | null}
          onChange={onInputChange}
          disabled={disabled}
        />
        
        <RatingField 
          label="Comunicación" 
          name="communication_score"
          value={getValue('communication_score') as number | null}
          onChange={onInputChange}
          disabled={disabled}
        />
        
        <RatingField 
          label="Confiabilidad" 
          name="reliability_score"
          value={getValue('reliability_score') as number | null}
          onChange={onInputChange}
          disabled={disabled}
        />
      </div>
    </div>
  );
};
