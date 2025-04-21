
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
  // Ensure value is always a boolean or null, never undefined
  const safeValue = value !== undefined ? value : null;
  
  const handleClick = (newValue: boolean | null) => {
    if (disabled) return;
    
    // If clicking the same value that's already selected, clear it (set to null)
    // Otherwise set to the new value
    onChange(name, safeValue === newValue ? null : newValue);
  };

  return (
    <div className="space-y-2" data-testid={`tristate-field-${name}`}>
      <label className="text-sm font-medium">{label}</label>
      <div className="flex space-x-2">
        <Button
          type="button"
          size="sm"
          variant={safeValue === true ? "default" : "outline"}
          onClick={() => handleClick(true)}
          aria-label={`${label} - Sí`}
          disabled={disabled}
        >
          <Check className="mr-1 h-4 w-4" /> Sí
        </Button>
        <Button
          type="button"
          size="sm"
          variant={safeValue === false ? "destructive" : "outline"}
          onClick={() => handleClick(false)}
          aria-label={`${label} - No`}
          disabled={disabled}
        >
          <X className="mr-1 h-4 w-4" /> No
        </Button>
      </div>
    </div>
  );
};
