
import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { Prospect } from '@/services/prospectService';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface ViewDetailsButtonProps {
  prospect: Prospect;
  onViewDetails: (prospect: Prospect) => void;
}

const ViewDetailsButton: React.FC<ViewDetailsButtonProps> = ({ prospect, onViewDetails }) => {
  return (
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
  );
};

export default ViewDetailsButton;
