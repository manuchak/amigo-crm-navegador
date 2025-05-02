
import React from 'react';
import { Phone, ClipboardCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { TooltipProvider } from '@/components/ui/tooltip';

interface CallInfoProps {
  callCount: number | null;
  lastCallDate: string | null;
  hasInterviewData: boolean;
  endedReason?: string | null;
}

const CallInfo: React.FC<CallInfoProps> = ({
  callCount,
  lastCallDate,
  hasInterviewData,
  endedReason
}) => {
  // Format the last call date for display
  const formattedLastCallDate = lastCallDate ? 
    new Date(lastCallDate).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }) : null;
    
  // Generate a appropriate color based on the ended_reason
  const getEndedReasonColor = (reason: string | null | undefined): string => {
    if (!reason) return "bg-gray-200 text-gray-700";
    
    const reasonLower = reason.toLowerCase();
    
    if (reasonLower.includes('completed') || reasonLower.includes('completado')) {
      return "bg-green-100 text-green-800";
    } 
    else if (reasonLower.includes('answered') || reasonLower.includes('contestado')) {
      return "bg-blue-100 text-blue-800";
    }
    else if (reasonLower.includes('busy') || reasonLower.includes('ocupado')) {
      return "bg-yellow-100 text-yellow-800";
    } 
    else if (reasonLower.includes('no-answer') || reasonLower.includes('no contestado') || reasonLower.includes('missing')) {
      return "bg-orange-100 text-orange-800";
    }
    else if (reasonLower.includes('failed') || reasonLower.includes('fallido') || reasonLower.includes('error')) {
      return "bg-red-100 text-red-800";
    }
    
    return "bg-gray-200 text-gray-700";
  };
  
  // Más prominente y claro ahora
  const endedReasonDisplay = endedReason ? (
    <div className="mt-1">
      <Badge 
        variant="outline" 
        className={`text-xs font-medium px-2 py-1 w-full text-center ${getEndedReasonColor(endedReason)}`}
      >
        {endedReason}
      </Badge>
    </div>
  ) : null;

  if (!callCount || callCount === 0) {
    return (
      <div className="text-xs text-slate-500">
        No hay llamadas registradas
        {endedReasonDisplay}
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col">
        <div className="flex items-center">
          <Phone className="h-3.5 w-3.5 mr-1 text-slate-400" />
          <span className="text-sm">
            {callCount} {callCount === 1 ? 'llamada' : 'llamadas'}
          </span>
          
          {hasInterviewData && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="ml-2">
                  <ClipboardCheck className="h-3.5 w-3.5 text-green-500" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Entrevista completada</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
        
        {formattedLastCallDate && (
          <div className="text-xs text-slate-500">
            Última: {formattedLastCallDate}
          </div>
        )}
        
        {endedReasonDisplay}
      </div>
    </TooltipProvider>
  );
};

export default CallInfo;
