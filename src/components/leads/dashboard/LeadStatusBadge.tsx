
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface LeadStatusBadgeProps {
  status: string;
}

const LeadStatusBadge: React.FC<LeadStatusBadgeProps> = ({ status }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Nuevo": return "info";
      case "Contactado": return "warning";
      case "1er Contacto": return "warning";
      case "Contacto Llamado": return "purple";
      case "Calificado": return "success";
      case "Validado": return "primary";  // Added new style for Validado status
      case "Rechazado": return "destructive";
      default: return "secondary";
    }
  };

  return (
    <Badge variant={getStatusColor(status)} className="font-normal">
      {status}
    </Badge>
  );
};

export default LeadStatusBadge;
