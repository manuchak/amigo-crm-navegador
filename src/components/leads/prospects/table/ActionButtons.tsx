
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
              className="h-8 w-8 rounded-full"
              onClick={() => onViewDetails(prospect)}
            >
              <Eye className="h-3.5 w-3.5" />
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
              className="h-8 w-8 rounded-full"
              onClick={() => onCall(prospect)}
            >
              <PhoneCall className="h-3.5 w-3.5" />
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
              className="h-8 w-8 rounded-full"
              onClick={() => onViewCalls(prospect)}
            >
              <History className="h-3.5 w-3.5" />
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
              className={`h-8 w-8 rounded-full ${hasInterviewData ? 'bg-green-50 text-green-600 hover:bg-green-100' : ''}`}
              onClick={() => onValidate(prospect)}
            >
              <Check className="h-3.5 w-3.5" />
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
