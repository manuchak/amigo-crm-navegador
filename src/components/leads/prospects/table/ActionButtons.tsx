
import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye, PhoneCall, History, Check } from 'lucide-react';
import { Prospect } from '@/services/prospectService';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { vapiWebhookUtils } from '@/hooks/lead-call-logs/webhook';
import { toast } from 'sonner';

interface ActionButtonsProps {
  prospect: Prospect;
  onViewDetails?: (prospect: Prospect) => void;
  onCall?: (prospect: Prospect) => void;
  onViewCalls?: (prospect: Prospect) => void;
  onValidate?: (prospect: Prospect) => void;
  hasCallHistory: boolean;
  hasInterviewData: boolean;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  prospect,
  onViewDetails,
  onCall,
  onViewCalls,
  onValidate,
  hasCallHistory,
  hasInterviewData
}) => {
  const handleCallClick = async (prospect: Prospect) => {
    // Get the phone number
    const phoneNumber = prospect.lead_phone || prospect.phone_number_intl;
    
    if (!phoneNumber) {
      toast.error("No se encontró un número telefónico para este custodio");
      return;
    }

    try {
      // Initiate VAPI call
      const callResult = await vapiWebhookUtils.initiateVapiCall(
        phoneNumber,
        prospect.lead_name || prospect.custodio_name || 'Prospecto', 
        prospect.lead_id || 0
      );

      if (!callResult.success) {
        throw new Error(callResult.error || callResult.message || "Error al iniciar llamada VAPI");
      }

      toast.success(`Llamada VAPI iniciada para ${prospect.lead_name || prospect.custodio_name || 'el prospecto'}`);
      
      // Also call the original onCall handler if provided
      if (onCall) {
        onCall(prospect);
      }
    } catch (error) {
      console.error("Error al iniciar llamada VAPI:", error);
      toast.error("Error al iniciar la llamada VAPI");
      
      // Still call the original onCall handler in case there's fallback logic
      if (onCall) {
        onCall(prospect);
      }
    }
  };

  return (
    <div className="flex items-center justify-end gap-2">
      {onViewDetails && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon"
              className="h-8 w-8 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900"
              onClick={() => onViewDetails(prospect)}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p className="text-xs">Ver detalles</p>
          </TooltipContent>
        </Tooltip>
      )}
      
      {onCall && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon"
              className="h-8 w-8 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900"
              onClick={() => handleCallClick(prospect)}
            >
              <PhoneCall className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p className="text-xs">Llamar</p>
          </TooltipContent>
        </Tooltip>
      )}
      
      {onViewCalls && hasCallHistory && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon"
              className="h-8 w-8 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900"
              onClick={() => onViewCalls(prospect)}
            >
              <History className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p className="text-xs">Historial</p>
          </TooltipContent>
        </Tooltip>
      )}
      
      {onValidate && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant={hasInterviewData ? "ghost" : "outline"}
              size="icon"
              className={`h-8 w-8 rounded-full ${hasInterviewData ? 'bg-green-100 text-green-600 hover:bg-green-200' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
              onClick={() => onValidate(prospect)}
            >
              <Check className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p className="text-xs">Validar</p>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
};

export default ActionButtons;
