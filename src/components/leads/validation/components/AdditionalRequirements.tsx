
import React from 'react';
import { TriStateField } from './TriStateField';
import { ValidationFormData } from '../types';

interface AdditionalRequirementsProps {
  formData: ValidationFormData;
  onInputChange: (name: keyof ValidationFormData, value: any) => void;
}

export const AdditionalRequirements: React.FC<AdditionalRequirementsProps> = ({
  formData,
  onInputChange
}) => {
  return (
    <div className="space-y-4">
      <div className="text-sm font-medium text-muted-foreground">Requisitos Adicionales</div>
      <TriStateField 
        label="Tiene experiencia en seguridad" 
        name="has_security_experience"
        value={formData.has_security_experience}
        onChange={onInputChange}
      />
      <TriStateField 
        label="Tiene antecedentes militares" 
        name="has_military_background"
        value={formData.has_military_background}
        onChange={onInputChange}
      />
      <TriStateField 
        label="Posee vehículo propio" 
        name="has_vehicle"
        value={formData.has_vehicle}
        onChange={onInputChange}
      />
      <TriStateField 
        label="Posee licencia de armas" 
        name="has_firearm_license"
        value={formData.has_firearm_license}
        onChange={onInputChange}
      />
    </div>
  );
};
