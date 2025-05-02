
import React from 'react';
import { Button } from '@/components/ui/button';
import { Check, Phone, XCircle, AlertCircle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CallStatusFilterProps {
  selectedStatus: string | null;
  onStatusChange: (status: string | null) => void;
}

const CallStatusFilter: React.FC<CallStatusFilterProps> = ({
  selectedStatus,
  onStatusChange,
}) => {
  // Updated call statuses based on VAPI ended_reason values from the screenshot
  const callStatuses = [
    { id: 'completed', label: 'Completada', color: 'bg-green-100 border-green-400 text-green-700', icon: <Check className="h-3.5 w-3.5 text-green-500" /> },
    { id: 'customer-did-not-answer', label: 'No contestó', color: 'bg-amber-100 border-amber-400 text-amber-700', icon: <Phone className="h-3.5 w-3.5 text-amber-500" /> },
    { id: 'queued', label: 'En cola', color: 'bg-blue-100 border-blue-400 text-blue-700', icon: <Clock className="h-3.5 w-3.5 text-blue-500" /> },
    { id: 'busy', label: 'Ocupado', color: 'bg-yellow-100 border-yellow-400 text-yellow-700', icon: <AlertCircle className="h-3.5 w-3.5 text-yellow-500" /> },
    { id: 'failed', label: 'Fallida', color: 'bg-red-100 border-red-400 text-red-700', icon: <XCircle className="h-3.5 w-3.5 text-red-500" /> },
  ];

  return (
    <div className="flex flex-wrap gap-2 items-center pb-4">
      <Button
        variant={selectedStatus === null ? "secondary" : "outline"}
        className="h-8 text-xs"
        onClick={() => onStatusChange(null)}
      >
        Todos
      </Button>
      
      {callStatuses.map((status) => (
        <Button
          key={status.id}
          variant={selectedStatus === status.id ? "secondary" : "outline"}
          className={`h-8 text-xs flex items-center gap-1.5 ${selectedStatus === status.id ? '' : 'border'}`}
          onClick={() => onStatusChange(status.id)}
        >
          <span className={`mr-1 ${selectedStatus === status.id ? '' : 'opacity-70'}`}>
            {status.icon}
          </span>
          {status.label}
        </Button>
      ))}
    </div>
  );
};

export default CallStatusFilter;
