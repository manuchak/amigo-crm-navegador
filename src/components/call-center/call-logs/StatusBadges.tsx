
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Check, Phone, PhoneForwarded, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: string | null;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  if (!status) return <Badge variant="secondary">Desconocido</Badge>;
  
  switch (status.toLowerCase()) {
    case 'completed':
      return <Badge variant="success" className="bg-green-500">Completada</Badge>;
    case 'failed':
      return <Badge variant="destructive">Fallida</Badge>;
    case 'ongoing':
      return <Badge variant="warning" className="bg-yellow-500 hover:bg-yellow-600">En curso</Badge>;
    case 'queued':
      return <Badge variant="outline" className="border-blue-500 text-blue-700">En cola</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

interface DirectionBadgeProps {
  direction: string | null;
}

export const DirectionBadge: React.FC<DirectionBadgeProps> = ({ direction }) => {
  if (!direction) return <Badge variant="secondary">Desconocido</Badge>;
  
  switch (direction.toLowerCase()) {
    case 'inbound':
      return <Badge className="bg-blue-500 flex items-center"><Phone className="mr-1 h-3 w-3" /> Entrante</Badge>;
    case 'outbound':
      return <Badge className="bg-purple-500 flex items-center"><PhoneForwarded className="mr-1 h-3 w-3" /> Saliente</Badge>;
    default:
      return <Badge variant="secondary">{direction}</Badge>;
  }
};

interface EvaluationBadgeProps {
  evaluation: string | null;
}

export const EvaluationBadge: React.FC<EvaluationBadgeProps> = ({ evaluation }) => {
  if (!evaluation) return null;
  
  switch (evaluation.toLowerCase()) {
    case 'success':
    case 'successful':
      return <Badge variant="success" className="bg-green-500 flex items-center"><Check className="mr-1 h-3 w-3" /> Exitosa</Badge>;
    case 'failed':
    case 'failure':
      return <Badge variant="destructive" className="flex items-center"><XCircle className="mr-1 h-3 w-3" /> Fallida</Badge>;
    default:
      return <Badge variant="secondary">{evaluation}</Badge>;
  }
};
