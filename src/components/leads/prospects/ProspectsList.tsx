
import React, { useState } from 'react';
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
import { TooltipProvider } from '@/components/ui/tooltip';
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
  
  // Filter prospects by call status first (our primary filter now)
  const filteredProspects = prospects
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

  const handleViewModeChange = (mode: 'grid' | 'table') => {
    setViewMode(mode);
  };

  // Handle call status filter changes
  const handleCallStatusFilterChange = (status: string | null) => {
    setCallStatusFilter(status);
  };

  return (
    <TooltipProvider>
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
          onViewDetails={onViewDetails}
          onCall={onCall}
          onViewCalls={onViewCalls}
          onValidate={onValidate}
        />
      </div>
    </TooltipProvider>
  );
};

export default ProspectsList;
