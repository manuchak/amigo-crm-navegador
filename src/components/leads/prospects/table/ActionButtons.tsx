
import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye, PhoneCall, History, Check } from 'lucide-react';
import { Prospect } from '@/services/prospectService';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

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
  return (
    <div className="flex justify-end space-x-1">
      {onViewDetails && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon"
              className="h-8 w-8 rounded-full bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-900"
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
              className="h-8 w-8 rounded-full bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-900"
              onClick={() => onCall(prospect)}
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
              className="h-8 w-8 rounded-full bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-900"
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
              className={`h-8 w-8 rounded-full ${hasInterviewData ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'}`}
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
