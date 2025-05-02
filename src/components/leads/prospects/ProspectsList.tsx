
import React, { useState } from 'react';
import { Prospect } from '@/services/prospectService';
import { useProspects } from '@/hooks/useProspects';
import { Card } from '@/components/ui/card';
import ProspectCard from './ProspectCard';
import ProspectsTable from './ProspectsTable';
import { 
  ProspectFilters, 
  LoadingState, 
  EmptyState,
  ProspectsContent 
} from './components';
import { TooltipProvider } from '@/components/ui/tooltip';
import { CallStatusBadge } from '@/components/shared/call-logs/CallStatusBadge';

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
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [showOnlyInterviewed, setShowOnlyInterviewed] = useState<boolean>(false);
  const [callStatusFilter, setCallStatusFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [refreshing, setRefreshing] = useState<boolean>(false);
  
  // Función para normalizar un estado de llamada para comparación
  const normalizeCallStatus = (status: string | null | undefined): string => {
    if (!status) return '';
    status = status.toLowerCase();
    
    // Normaliza diferentes variaciones del mismo estado
    if (status.includes('complete')) return 'completed';
    if (status.includes('no-answer') || status.includes('no answer')) return 'no-answer';
    if (status.includes('busy') || status.includes('ocupado')) return 'busy';
    if (status.includes('fail')) return 'failed';
    
    return status;
  };
  
  // Filter by status, interviews and call status
  // Use a unique identifier for each prospect to avoid duplicates
  const filteredProspects = prospects
    .filter(prospect => !filterStatus || prospect.lead_status === filterStatus)
    .filter(prospect => !showOnlyInterviewed || prospect.transcript !== null)
    .filter(prospect => {
      if (!callStatusFilter) return true;
      const normalizedEndedReason = normalizeCallStatus(prospect.ended_reason);
      const normalizedFilter = normalizeCallStatus(callStatusFilter);
      return normalizedEndedReason === normalizedFilter;
    })
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

  // Nueva función para manejar el filtro por estado de llamada
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
        
        {/* Call status filter buttons in Spanish */}
        <div className="flex flex-wrap gap-2 overflow-x-auto pb-2">
          <Card className="border p-1 shadow-sm flex flex-wrap gap-2">
            <button
              className={`px-4 py-1.5 rounded-md text-xs font-medium transition-colors ${!callStatusFilter ? 'bg-slate-100 text-slate-800' : 'hover:bg-slate-50'}`}
              onClick={() => handleCallStatusFilterChange(null)}
            >
              Todos
            </button>
            <button
              className={`px-4 py-1.5 rounded-md text-xs font-medium transition-colors ${callStatusFilter === 'completed' ? 'bg-green-50 border-green-200 text-green-800' : 'hover:bg-slate-50'}`}
              onClick={() => handleCallStatusFilterChange('completed')}
            >
              <span className="flex items-center">
                <CallStatusBadge status="completed" className="mr-1" /> 
                Completadas
              </span>
            </button>
            <button
              className={`px-4 py-1.5 rounded-md text-xs font-medium transition-colors ${callStatusFilter === 'no-answer' ? 'bg-orange-50 border-orange-200 text-orange-800' : 'hover:bg-slate-50'}`}
              onClick={() => handleCallStatusFilterChange('no-answer')}
            >
              <span className="flex items-center">
                <CallStatusBadge status="no-answer" className="mr-1" /> 
                Sin respuesta
              </span>
            </button>
            <button
              className={`px-4 py-1.5 rounded-md text-xs font-medium transition-colors ${callStatusFilter === 'busy' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' : 'hover:bg-slate-50'}`}
              onClick={() => handleCallStatusFilterChange('busy')}
            >
              <span className="flex items-center">
                <CallStatusBadge status="busy" className="mr-1" /> 
                Ocupado
              </span>
            </button>
            <button
              className={`px-4 py-1.5 rounded-md text-xs font-medium transition-colors ${callStatusFilter === 'failed' ? 'bg-red-50 border-red-200 text-red-800' : 'hover:bg-slate-50'}`}
              onClick={() => handleCallStatusFilterChange('failed')}
            >
              <span className="flex items-center">
                <CallStatusBadge status="failed" className="mr-1" /> 
                Fallidas
              </span>
            </button>
          </Card>
        </div>
        
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
