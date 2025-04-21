
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TriStateField } from './TriStateField';
import { ValidationFormData } from '../types';

interface AdditionalRequirementsProps {
  formData: ValidationFormData;
  onInputChange: (name: keyof ValidationFormData, value: any) => void;
  disabled?: boolean;
}

export const AdditionalRequirements: React.FC<AdditionalRequirementsProps> = ({ 
  formData, 
  onInputChange,
  disabled = false
}) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">Requisitos Adicionales</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <TriStateField 
          label="Tiene experiencia en seguridad" 
          name="has_security_experience"
          value={formData.has_security_experience}
          onChange={onInputChange}
          disabled={disabled}
        />
        <TriStateField 
          label="Tiene experiencia militar" 
          name="has_military_background"
          value={formData.has_military_background}
          onChange={onInputChange}
          disabled={disabled}
        />
        <TriStateField 
          label="Tiene vehículo propio" 
          name="has_vehicle"
          value={formData.has_vehicle}
          onChange={onInputChange}
          disabled={disabled}
        />
        <TriStateField 
          label="Tiene licencia para portar armas" 
          name="has_firearm_license"
          value={formData.has_firearm_license}
          onChange={onInputChange}
          disabled={disabled}
        />
      </CardContent>
    </Card>
  );
};
