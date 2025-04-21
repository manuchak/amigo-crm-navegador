
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ValidationFormData } from '../types';

interface TriStateFieldProps {
  label: string;
  name: keyof ValidationFormData;
  description?: string;
  value: boolean | null;
  onChange: (name: keyof ValidationFormData, value: any) => void;
}

export const TriStateField: React.FC<TriStateFieldProps> = ({
  label,
  name,
  description,
  value,
  onChange
}) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium">{label}</label>
        {value !== null && (
          <Badge 
            variant={value === true ? "success" : "destructive"} 
            className="ml-2"
          >
            {value === true ? "Sí" : "No"}
          </Badge>
        )}
      </div>
      <RadioGroup 
        className="flex space-x-4" 
        value={value === null ? undefined : value.toString()}
        onValueChange={(val) => onChange(name, val === "true")}
      >
        <div className="flex items-center space-x-1">
          <RadioGroupItem value="true" id={`${name}-yes`} />
          <label htmlFor={`${name}-yes`} className="text-sm font-normal">Sí</label>
        </div>
        <div className="flex items-center space-x-1">
          <RadioGroupItem value="false" id={`${name}-no`} />
          <label htmlFor={`${name}-no`} className="text-sm font-normal">No</label>
        </div>
      </RadioGroup>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
    </div>
  );
};
