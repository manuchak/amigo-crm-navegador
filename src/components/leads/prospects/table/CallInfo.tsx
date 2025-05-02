
import React from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Phone, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { normalizeCallStatus, getCallStatusColor, getCallStatusLabel } from '@/lib/utils';

interface CallInfoProps {
  callCount: number | null;
  lastCallDate: string | null;
  hasInterviewData: boolean;
  endedReason: string | null;
}

const CallInfo: React.FC<CallInfoProps> = ({
  callCount,
  lastCallDate,
  hasInterviewData,
  endedReason
}) => {
  const normalizedStatus = normalizeCallStatus(endedReason);
  const colorClass = getCallStatusColor(endedReason);
  const statusLabel = getCallStatusLabel(endedReason);
  
  return (
    <div className="flex flex-col space-y-1.5">
      <div className="flex items-center">
        {callCount ? (
          <div className="flex items-center text-sm">
            <Phone className="h-3.5 w-3.5 mr-1.5 text-slate-500" />
            <span className="font-medium">{callCount}</span>
            <span className="text-slate-500 ml-1">llamada{callCount !== 1 ? 's' : ''}</span>
          </div>
        ) : (
          <span className="text-slate-400 text-sm">Sin llamadas</span>
        )}
      </div>
      
      {endedReason && (
        <Badge variant="outline" className={`text-xs py-0.5 border ${colorClass}`}>
          {statusLabel}
        </Badge>
      )}
      
      {lastCallDate && (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="text-xs text-slate-500 hover:text-slate-700 cursor-help">
              Última: {new Date(lastCallDate).toLocaleDateString('es-MX')}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              {new Date(lastCallDate).toLocaleDateString('es-MX', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </TooltipContent>
        </Tooltip>
      )}
      
      {hasInterviewData && (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center text-xs text-emerald-600">
              <CheckCircle className="h-3 w-3 mr-1" />
              Entrevistado
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Este prospecto tiene una transcripción de entrevista</p>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
};

export default CallInfo;
