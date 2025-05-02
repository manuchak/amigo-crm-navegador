
import React from 'react';
import { format, isValid } from 'date-fns';
import { es } from 'date-fns/locale';
import { CallStatusBadge } from '@/components/shared/call-logs/CallStatusBadge';

interface CallInfoProps {
  callCount: number | null;
  lastCallDate: string | null;
  hasInterviewData?: boolean;
  endedReason?: string | null;
}

const CallInfo: React.FC<CallInfoProps> = ({ 
  callCount,
  lastCallDate,
  hasInterviewData = false,
  endedReason
}) => {
  // Format the date if it's valid
  const formattedDate = lastCallDate && isValid(new Date(lastCallDate))
    ? format(new Date(lastCallDate), "dd/MM/yyyy, HH:mm", { locale: es })
    : null;
  
  // Si no hay llamadas, mostrar "Sin llamadas"
  if (!callCount || callCount <= 0) {
    return <div className="text-sm text-slate-500">Sin llamadas</div>;
  }
  
  return (
    <div className="flex flex-col">
      <div className="flex items-center">
        <span className="font-medium text-sm">{callCount} {callCount === 1 ? 'llamada' : 'llamadas'}</span>
        {endedReason && (
          <span className="ml-2">
            <CallStatusBadge status={endedReason} />
          </span>
        )}
      </div>
      
      {formattedDate && (
        <div className="flex flex-col">
          <span className="text-xs text-slate-500">
            Última: {formattedDate}
          </span>
        </div>
      )}
      
      {hasInterviewData && (
        <span className="inline-flex items-center px-1.5 py-0.5 mt-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
          Entrevista
        </span>
      )}
    </div>
  );
};

export default CallInfo;
