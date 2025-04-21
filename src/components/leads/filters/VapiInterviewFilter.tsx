
import React from 'react';
import { Filter } from 'lucide-react';

interface VapiInterviewFilterProps {
  value: string;
  onChange: (newValue: string) => void;
}

const OPTIONS = [
  { value: 'todos', label: 'Todos' },
  { value: 'con_vapi', label: 'Con entrevista VAPI' },
  { value: 'sin_vapi', label: 'Sin entrevista VAPI' },
];

export const VapiInterviewFilter: React.FC<VapiInterviewFilterProps> = ({ value, onChange }) => (
  <div className="relative w-full md:w-44">
    <Filter className="absolute left-2 top-3 h-4 w-4 text-slate-400" />
    <select
      className="pl-8 pr-4 py-2 rounded-md bg-white border border-slate-200 text-sm shadow-sm w-full"
      value={value}
      onChange={e => onChange(e.target.value)}
    >
      {OPTIONS.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

