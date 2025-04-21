
import React from 'react';
import { Button } from '@/components/ui/button';
import { PhoneCall, CheckSquare, Clock } from 'lucide-react';
import { Prospect } from '@/services/prospectService';

interface ActionButtonsProps {
  prospect: Prospect;
  onCall?: (prospect: Prospect) => void;
  onViewDetails?: (prospect: Prospect) => void;
  onViewCalls?: (prospect: Prospect) => void;
  onValidate?: (prospect: Prospect) => void;
  hasCallHistory: boolean;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  prospect,
  onCall,
  onViewDetails,
  onViewCalls,
  onValidate,
  hasCallHistory
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-2">
      {onCall && (
        <Button variant="outline" size="sm" className="whitespace-nowrap" onClick={() => onCall(prospect)}>
          <PhoneCall className="h-4 w-4 mr-1" /> Llamar
        </Button>
      )}
      
      {onViewDetails && (
        <Button 
          variant="ghost" 
          size="sm"
          className="whitespace-nowrap" 
          onClick={() => onViewDetails(prospect)}
        >
          Ver detalles
        </Button>
      )}
      
      {onViewCalls && hasCallHistory && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onViewCalls(prospect)}
          className="whitespace-nowrap bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200"
        >
          <Clock className="h-4 w-4 mr-1" /> Historial
        </Button>
      )}
      
      {onValidate && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onValidate(prospect)}
          className="whitespace-nowrap bg-green-50 text-green-600 hover:bg-green-100 border-green-200"
        >
          <CheckSquare className="h-4 w-4 mr-1" /> Validar
        </Button>
      )}
    </div>
  );
};

export default ActionButtons;
