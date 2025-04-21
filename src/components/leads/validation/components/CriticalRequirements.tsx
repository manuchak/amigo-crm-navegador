
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TriStateField } from './TriStateField';
import { ValidationFormData } from '../types';

interface CriticalRequirementsProps {
  formData: ValidationFormData;
  onInputChange: (name: keyof ValidationFormData, value: any) => void;
  disabled?: boolean;
}

export const CriticalRequirements: React.FC<CriticalRequirementsProps> = ({ 
  formData, 
  onInputChange,
  disabled = false
}) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">Requisitos Críticos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <TriStateField 
          label="Tiene más de 21 años" 
          name="age_requirement_met"
          value={formData.age_requirement_met}
          onChange={onInputChange}
          disabled={disabled}
        />
        <TriStateField 
          label="Pasó entrevista inicial" 
          name="interview_passed"
          value={formData.interview_passed}
          onChange={onInputChange}
          disabled={disabled}
        />
        <TriStateField 
          label="Pasó revisión de antecedentes" 
          name="background_check_passed"
          value={formData.background_check_passed}
          onChange={onInputChange}
          disabled={disabled}
        />
      </CardContent>
    </Card>
  );
};
