
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface CallStatusBadgeProps {
  status: string | null;
}

export const CallStatusBadge: React.FC<CallStatusBadgeProps> = ({ status }) => {
  if (!status) return <Badge variant="outline">Desconocido</Badge>;
  
  const normalizedStatus = status.toLowerCase();
  
  if (normalizedStatus.includes('complet') || normalizedStatus.includes('success')) {
    return <Badge variant="outline" className="bg-green-50 text-green-600 hover:bg-green-100">Completada</Badge>;
  }
  
  if (normalizedStatus.includes('progress') || normalizedStatus.includes('calling')) {
    return <Badge variant="outline" className="bg-blue-50 text-blue-600 hover:bg-blue-100">En progreso</Badge>;
  }
  
  if (normalizedStatus.includes('fail') || normalizedStatus.includes('error')) {
    return <Badge variant="outline" className="bg-red-50 text-red-600 hover:bg-red-100">Fallida</Badge>;
  }
  
  if (normalizedStatus.includes('busy')) {
    return <Badge variant="outline" className="bg-yellow-50 text-yellow-600 hover:bg-yellow-100">Ocupado</Badge>;
  }
  
  if (normalizedStatus.includes('answer') || normalizedStatus.includes('pick')) {
    return <Badge variant="outline" className="bg-amber-50 text-amber-600 hover:bg-amber-100">No contestó</Badge>;
  }
  
  return <Badge variant="outline">{status}</Badge>;
};
