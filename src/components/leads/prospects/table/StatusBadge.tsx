
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface StatusBadgeProps {
  status: string | null;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  if (!status) return null;
  
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'nuevo': return 'bg-blue-50 text-blue-600';
      case 'contactado': return 'bg-amber-50 text-amber-600';
      case 'contacto llamado': return 'bg-amber-50 text-amber-600';
      case 'no llamado': return 'bg-slate-50 text-slate-600 border border-slate-200'; // New status
      case 'calificado': return 'bg-green-50 text-green-600';
      case 'validado': return 'bg-indigo-50 text-indigo-600'; // Added specific style for Validado status
      case 'rechazado': return 'bg-red-50 text-red-600';
      default: return 'bg-slate-100 text-slate-600';
    }
  };
  
  return (
    <Badge className={`${getStatusColor(status)}`}>
      {status}
    </Badge>
  );
};

export default StatusBadge;
