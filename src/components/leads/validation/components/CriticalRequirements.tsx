
import React from 'react';
import { TriStateField } from './TriStateField';
import { ValidationFormData } from '../types';

interface CriticalRequirementsProps {
  formData: ValidationFormData;
  onInputChange: (name: keyof ValidationFormData, value: any) => void;
}

export const CriticalRequirements: React.FC<CriticalRequirementsProps> = ({
  formData,
  onInputChange
}) => {
  return (
    <div className="space-y-4">
      <div className="text-sm font-medium text-muted-foreground">Requisitos Críticos</div>
      <TriStateField
        label="Cumple con requisito de edad"
        name="age_requirement_met"
        description="El custodio debe tener entre 25 y 55 años"
        value={formData.age_requirement_met}
        onChange={onInputChange}
      />
      <TriStateField
        label="Entrevista aprobada"
        name="interview_passed"
        description="Basado en la llamada y transcripción"
        value={formData.interview_passed}
        onChange={onInputChange}
      />
      <TriStateField
        label="Verificación de antecedentes aprobada"
        name="background_check_passed"
        value={formData.background_check_passed}
        onChange={onInputChange}
      />
    </div>
  );
};
