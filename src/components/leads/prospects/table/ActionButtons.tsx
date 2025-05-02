
import React from 'react';
import { Prospect } from '@/services/prospectService';
import { 
  ViewDetailsButton, 
  CallButton, 
  CallHistoryButton,
  ValidateButton 
} from './buttons';

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
    <div className="flex items-center justify-end gap-2">
      {onViewDetails && (
        <ViewDetailsButton 
          prospect={prospect} 
          onViewDetails={onViewDetails} 
        />
      )}
      
      {onCall && (
        <CallButton 
          prospect={prospect} 
          onCall={onCall} 
        />
      )}
      
      {onViewCalls && hasCallHistory && (
        <CallHistoryButton 
          prospect={prospect} 
          onViewCalls={onViewCalls} 
          hasCallHistory={hasCallHistory} 
        />
      )}
      
      {onValidate && (
        <ValidateButton 
          prospect={prospect} 
          onValidate={onValidate} 
          hasInterviewData={hasInterviewData} 
        />
      )}
    </div>
  );
};

export default ActionButtons;
