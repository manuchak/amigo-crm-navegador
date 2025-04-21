
import React from 'react';
import { Check, X } from 'lucide-react';

interface BooleanDisplayProps {
  value: boolean | null | undefined;
}

const BooleanDisplay: React.FC<BooleanDisplayProps> = ({ value }) => {
  if (value === true) return (
    <span className="flex items-center text-green-600">
      <Check className="h-3.5 w-3.5 mr-1" /> Sí
    </span>
  );
  if (value === false) return (
    <span className="flex items-center text-red-600">
      <X className="h-3.5 w-3.5 mr-1" /> No
    </span>
  );
  return "No especificado";
};

export default BooleanDisplay;
