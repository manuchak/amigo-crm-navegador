
import React from 'react';
import { Button } from '@/components/ui/button';
import { History } from 'lucide-react';
import { Prospect } from '@/services/prospectService';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface CallHistoryButtonProps {
  prospect: Prospect;
  onViewCalls: (prospect: Prospect) => void;
  hasCallHistory: boolean;
}

const CallHistoryButton: React.FC<CallHistoryButtonProps> = ({ 
  prospect, 
  onViewCalls, 
  hasCallHistory 
}) => {
  if (!hasCallHistory) return null;
  
  return (
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
  );
};

export default CallHistoryButton;
