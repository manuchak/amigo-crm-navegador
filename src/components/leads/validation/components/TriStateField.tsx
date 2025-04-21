
import React from 'react';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import { ValidationFormData } from '../types';

interface TriStateFieldProps {
  label: string;
  name: keyof ValidationFormData;
  value: boolean | null;
  onChange: (name: keyof ValidationFormData, value: any) => void;
  disabled?: boolean;
}

export const TriStateField: React.FC<TriStateFieldProps> = ({
  label,
  name,
  value,
  onChange,
  disabled = false
}) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <div className="flex space-x-2">
        <Button
          type="button"
          size="sm"
          variant={value === true ? "default" : "outline"}
          onClick={() => onChange(name, value === true ? null : true)}
          aria-label={`${label} - Sí`}
          disabled={disabled}
        >
          <Check className="mr-1 h-4 w-4" /> Sí
        </Button>
        <Button
          type="button"
          size="sm"
          variant={value === false ? "destructive" : "outline"}
          onClick={() => onChange(name, value === false ? null : false)}
          aria-label={`${label} - No`}
          disabled={disabled}
        >
          <X className="mr-1 h-4 w-4" /> No
        </Button>
      </div>
    </div>
  );
};
