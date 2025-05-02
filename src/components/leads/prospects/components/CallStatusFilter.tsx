
import React from 'react';
import { Card } from '@/components/ui/card';
import { CallStatusBadge } from '@/components/shared/call-logs/CallStatusBadge';

interface CallStatusFilterProps {
  selectedStatus: string | null;
  onStatusChange: (status: string | null) => void;
}

const CallStatusFilter: React.FC<CallStatusFilterProps> = ({ selectedStatus, onStatusChange }) => {
  // Define call status options
  const statusOptions = [
    { value: null, label: 'Todos', classes: 'hover:bg-slate-50' },
    { value: 'completed', label: 'Completadas', status: 'completed' },
    { value: 'no-answer', label: 'Sin respuesta', status: 'no-answer' },
    { value: 'busy', label: 'Ocupado', status: 'busy' },
    { value: 'failed', label: 'Fallidas', status: 'failed' }
  ];

  return (
    <Card className="border p-1 shadow-sm">
      <div className="flex flex-wrap gap-1.5">
        {statusOptions.map((option) => {
          const isSelected = selectedStatus === option.value;
          
          // For "Todos" option
          if (option.value === null) {
            return (
              <button
                key="all"
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  !selectedStatus ? 'bg-slate-100 text-slate-800' : option.classes
                }`}
                onClick={() => onStatusChange(null)}
              >
                {option.label}
              </button>
            );
          }
          
          // For call status options with badges
          return (
            <button
              key={option.value}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                isSelected ? 'bg-slate-100 shadow-sm' : 'hover:bg-slate-50'
              }`}
              onClick={() => onStatusChange(option.value)}
            >
              <span className="flex items-center gap-1">
                <CallStatusBadge 
                  status={option.status} 
                  size="sm"
                />
                {isSelected && <span className="ml-1">•</span>}
              </span>
            </button>
          );
        })}
      </div>
    </Card>
  );
};

export default CallStatusFilter;
