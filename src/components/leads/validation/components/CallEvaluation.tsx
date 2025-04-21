
import React from 'react';
import { RatingField } from './RatingField';
import { ValidationFormData } from '../types';

interface CallEvaluationProps {
  formData: ValidationFormData;
  onInputChange: (name: keyof ValidationFormData, value: any) => void;
}

export const CallEvaluation: React.FC<CallEvaluationProps> = ({
  formData,
  onInputChange
}) => {
  return (
    <div>
      <div className="text-sm font-medium text-muted-foreground mb-4">Evaluación de Llamada</div>
      
      <div className="grid sm:grid-cols-3 gap-4">
        <RatingField 
          label="Calidad de Llamada" 
          name="call_quality_score"
          value={formData.call_quality_score}
          onChange={onInputChange}
        />
        <RatingField 
          label="Comunicación" 
          name="communication_score"
          value={formData.communication_score}
          onChange={onInputChange}
        />
        <RatingField 
          label="Confiabilidad" 
          name="reliability_score"
          value={formData.reliability_score}
          onChange={onInputChange}
        />
      </div>
    </div>
  );
};
