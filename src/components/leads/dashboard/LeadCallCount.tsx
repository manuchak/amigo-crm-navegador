
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { HoverCard, HoverCardTrigger, HoverCardContent } from '@/components/ui/hover-card';
import { Phone } from 'lucide-react';

interface LeadCallCountProps {
  callCount: number | undefined;
}

const LeadCallCount: React.FC<LeadCallCountProps> = ({ callCount }) => {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <div className="flex items-center">
          <Badge variant="outline" className="cursor-pointer bg-slate-50 border-slate-200 text-slate-700">
            <Phone className="h-3 w-3 mr-1" />
            {callCount || 0}
          </Badge>
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="flex justify-between space-x-4">
          <div className="space-y-1">
            <h4 className="text-sm font-semibold">Historial de llamadas</h4>
            <p className="text-sm text-slate-500">
              Se han realizado {callCount || 0} intentos de llamada a este custodio.
            </p>
            <p className="text-xs text-slate-400">
              Haz clic en "Detalles" para ver el registro completo.
            </p>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

export default LeadCallCount;
