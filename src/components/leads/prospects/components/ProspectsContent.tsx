
import React from 'react';
import { Prospect } from '@/services/prospectService';
import ProspectCard from '../ProspectCard';
import ProspectsTable from '../ProspectsTable';
import LoadingState from './LoadingState';
import EmptyState from './EmptyState';

interface ProspectsContentProps {
  loading: boolean;
  prospects: Prospect[];
  showOnlyInterviewed: boolean;
  viewMode: 'grid' | 'table';
  onViewDetails?: (prospect: Prospect) => void;
  onCall?: (prospect: Prospect) => void;
  onViewCalls?: (prospect: Prospect) => void;
  onValidate?: (prospect: Prospect) => void;
}

const ProspectsContent: React.FC<ProspectsContentProps> = ({
  loading,
  prospects,
  showOnlyInterviewed,
  viewMode,
  onViewDetails,
  onCall,
  onViewCalls,
  onValidate
}) => {
  if (loading) {
    return <LoadingState />;
  }
  
  if (prospects.length === 0) {
    return <EmptyState showOnlyInterviewed={showOnlyInterviewed} />;
  }
  
  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {prospects.map((prospect) => (
          <ProspectCard 
            key={`prospect-${prospect.lead_id}-${prospect.validated_lead_id}`}
            prospect={prospect}
            onViewDetails={onViewDetails}
            onCall={onCall}
            onViewCalls={onViewCalls}
            onValidate={onValidate}
          />
        ))}
      </div>
    );
  }
  
  return (
    <ProspectsTable 
      prospects={prospects} 
      onViewDetails={onViewDetails}
      onCall={onCall}
      onViewCalls={onViewCalls}
      onValidate={onValidate}
    />
  );
};

export default ProspectsContent;
