
import React, { useState } from 'react';
import { Prospect } from '@/services/prospectService';
import { useProspects } from '@/hooks/useProspects';
import { Card } from '@/components/ui/card';
import { 
  ProspectFilters, 
  LoadingState, 
  EmptyState,
  ProspectsContent
} from './components';

interface ValidatedProspectsListProps {
  onViewDetails?: (prospect: Prospect) => void;
  onCall?: (prospect: Prospect) => void;
  onViewCalls?: (prospect: Prospect) => void;
}

const ValidatedProspectsList: React.FC<ValidatedProspectsListProps> = ({ 
  onViewDetails, 
  onCall,
  onViewCalls
}) => {
  const { prospects, loading, refetch } = useProspects();
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [refreshing, setRefreshing] = useState<boolean>(false);
  
  // Only show validated prospects
  const validatedProspects = React.useMemo(() => {
    return prospects.filter(prospect => prospect.lead_status === 'Validado');
  }, [prospects]);
  
  // Filter by search query
  const filteredProspects = validatedProspects.filter(prospect => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      prospect.lead_name?.toLowerCase().includes(query) ||
      prospect.custodio_name?.toLowerCase().includes(query) ||
      prospect.lead_email?.toLowerCase().includes(query) ||
      prospect.lead_phone?.toLowerCase().includes(query) ||
      prospect.phone_number_intl?.toLowerCase().includes(query) ||
      prospect.lead_id?.toString().includes(query) ||
      prospect.sedena_id?.toLowerCase().includes(query)
    );
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleViewModeChange = (mode: 'grid' | 'table') => {
    setViewMode(mode);
  };

  return (
    <div className="space-y-4">
      <ProspectFilters 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filter="Validado"
        onFilterChange={() => {}} // No filter change needed as we only show validated
        showOnlyInterviewed={false}
        onToggleInterviewed={() => {}}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        hideFilters={true} // Hide unnecessary filters
      />
      
      <ProspectsContent
        loading={loading}
        prospects={filteredProspects}
        showOnlyInterviewed={false}
        viewMode={viewMode}
        onViewDetails={onViewDetails}
        onCall={onCall}
        onViewCalls={onViewCalls}
        onValidate={undefined} // No validation option for already validated prospects
      />
    </div>
  );
};

export default ValidatedProspectsList;
