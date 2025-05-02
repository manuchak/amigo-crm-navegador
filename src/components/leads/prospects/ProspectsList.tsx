
import React, { useState, useEffect } from 'react';
import { Prospect } from '@/services/prospectService';
import { useProspects } from '@/hooks/useProspects';
import { Card } from '@/components/ui/card';
import { 
  ProspectFilters, 
  LoadingState, 
  EmptyState,
  ProspectsContent,
  CallStatusFilter
} from './components';
import { normalizeCallStatus } from '@/lib/utils';

interface ProspectsListProps {
  onViewDetails?: (prospect: Prospect) => void;
  onCall?: (prospect: Prospect) => void;
  onViewCalls?: (prospect: Prospect) => void;
  onValidate?: (prospect: Prospect) => void;
}

const ProspectsList: React.FC<ProspectsListProps> = ({ 
  onViewDetails, 
  onCall,
  onViewCalls,
  onValidate
}) => {
  const { prospects, loading, refetch } = useProspects();
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [showOnlyInterviewed, setShowOnlyInterviewed] = useState<boolean>(false);
  const [callStatusFilter, setCallStatusFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [refreshing, setRefreshing] = useState<boolean>(false);
  
  // Filter out validated prospects - we don't want to see them in the prospects list
  const filteredByValidation = React.useMemo(() => {
    return prospects.filter(prospect => prospect.lead_status !== 'Validado');
  }, [prospects]);
  
  // Then, remove duplicates from the filtered prospects array using a Map
  const uniqueProspects = React.useMemo(() => {
    const uniqueMap = new Map();
    
    filteredByValidation.forEach(prospect => {
      const key = prospect.lead_id || 
                 (prospect.lead_phone?.replace(/\D/g, '') || 
                 prospect.phone_number_intl?.replace(/\D/g, '') || '');
      
      // Only add to map if it doesn't exist or if this one has a transcript and the existing one doesn't
      if (!key) return; // Skip if no unique identifier
      
      if (!uniqueMap.has(key) || 
          (prospect.transcript && !uniqueMap.get(key).transcript)) {
        uniqueMap.set(key, prospect);
      }
    });
    
    return Array.from(uniqueMap.values());
  }, [filteredByValidation]);
  
  // Then filter prospects by call status first (our primary filter now)
  const filteredProspects = uniqueProspects
    .filter(prospect => {
      if (!callStatusFilter) return true;
      const normalizedEndedReason = normalizeCallStatus(prospect.ended_reason);
      return normalizedEndedReason === callStatusFilter;
    })
    .filter(prospect => !filterStatus || prospect.lead_status === filterStatus)
    .filter(prospect => !showOnlyInterviewed || prospect.transcript !== null)
    .filter(prospect => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        prospect.lead_name?.toLowerCase().includes(query) ||
        prospect.custodio_name?.toLowerCase().includes(query) ||
        prospect.lead_email?.toLowerCase().includes(query) ||
        prospect.lead_phone?.toLowerCase().includes(query) ||
        prospect.phone_number_intl?.toLowerCase().includes(query) ||
        prospect.lead_id?.toString().includes(query) ||
        prospect.ended_reason?.toLowerCase().includes(query)
      );
    });

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  // Refresh the prospect list when a prospect is validated
  const handleValidate = async (prospect: Prospect) => {
    if (onValidate) {
      onValidate(prospect);
    }
    // After a short delay, refresh the list to remove the validated prospect
    setTimeout(() => {
      handleRefresh();
    }, 1000);
  };

  const handleViewModeChange = (mode: 'grid' | 'table') => {
    setViewMode(mode);
  };

  // Handle call status filter changes
  const handleCallStatusFilterChange = (status: string | null) => {
    setCallStatusFilter(status);
  };

  return (
    <div className="space-y-4">
      <ProspectFilters 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filter={filterStatus || undefined}
        onFilterChange={setFilterStatus} 
        showOnlyInterviewed={showOnlyInterviewed}
        onToggleInterviewed={() => setShowOnlyInterviewed(!showOnlyInterviewed)}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        onRefresh={handleRefresh}
        refreshing={refreshing}
      />
      
      {/* Call status filter now prominently displayed */}
      <Card className="p-3 border shadow-sm">
        <div className="font-medium text-sm mb-2 text-slate-600">Filtrar por resultado de llamada:</div>
        <CallStatusFilter
          selectedStatus={callStatusFilter}
          onStatusChange={handleCallStatusFilterChange}
        />
      </Card>
      
      <ProspectsContent
        loading={loading}
        prospects={filteredProspects}
        showOnlyInterviewed={showOnlyInterviewed}
        viewMode={viewMode}
        onViewDetails={(prospect) => onViewDetails && onViewDetails(prospect)}
        onCall={(prospect) => onCall && onCall(prospect)}
        onViewCalls={(prospect) => onViewCalls && onViewCalls(prospect)}
        onValidate={handleValidate}
      />
    </div>
  );
};

export default ProspectsList;
