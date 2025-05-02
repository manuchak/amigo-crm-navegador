
import React from 'react';
import { Check, X } from 'lucide-react';

interface BooleanDisplayProps {
  value: boolean | null | undefined;
}

const BooleanDisplay: React.FC<BooleanDisplayProps> = ({ value }) => {
  if (value === true) return (
    <span className="flex items-center text-green-600 font-medium">
      <Check className="h-3.5 w-3.5 mr-1" /> SÍ
    </span>
  );
  if (value === false) return (
    <span className="flex items-center text-red-600 font-medium">
      <X className="h-3.5 w-3.5 mr-1" /> NO
    </span>
  );
  return <span className="text-slate-400">No especificado</span>;
};

export default BooleanDisplay;
