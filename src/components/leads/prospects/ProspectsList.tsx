
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
  const [showByCallStatus, setShowByCallStatus] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Filtrar por estado, entrevistas y estado de llamada
  const filteredProspects = prospects
    .filter(prospect => !filterStatus || prospect.lead_status === filterStatus)
    .filter(prospect => !showOnlyInterviewed || prospect.transcript !== null)
    .filter(prospect => !showByCallStatus || prospect.ended_reason?.toLowerCase().includes(showByCallStatus.toLowerCase()))
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

  const handleRefresh = () => {
    refetch();
  };

  const handleViewModeChange = (mode: 'grid' | 'table') => {
    setViewMode(mode);
  };

  const handleFilterByCallStatus = (status: string | null) => {
    setShowByCallStatus(status);
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
          refreshing={loading}
        />
        
        {/* Filtros por estado de llamada */}
        <div className="flex flex-wrap gap-2 overflow-x-auto pb-2">
          <Card className="border p-1 shadow-sm flex flex-wrap gap-2">
            <button
              className={`px-4 py-1.5 rounded-md text-xs font-medium transition-colors ${!showByCallStatus ? 'bg-slate-100 text-slate-800' : 'hover:bg-slate-50'}`}
              onClick={() => handleFilterByCallStatus(null)}
            >
              Todos
            </button>
            <button
              className={`px-4 py-1.5 rounded-md text-xs font-medium transition-colors ${showByCallStatus === 'completed' ? 'bg-green-50 border-green-200 text-green-800' : 'hover:bg-slate-50'}`}
              onClick={() => handleFilterByCallStatus('completed')}
            >
              Completadas
            </button>
            <button
              className={`px-4 py-1.5 rounded-md text-xs font-medium transition-colors ${showByCallStatus === 'no-answer' ? 'bg-orange-50 border-orange-200 text-orange-800' : 'hover:bg-slate-50'}`}
              onClick={() => handleFilterByCallStatus('no-answer')}
            >
              Sin respuesta
            </button>
            <button
              className={`px-4 py-1.5 rounded-md text-xs font-medium transition-colors ${showByCallStatus === 'busy' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' : 'hover:bg-slate-50'}`}
              onClick={() => handleFilterByCallStatus('busy')}
            >
              Ocupado
            </button>
            <button
              className={`px-4 py-1.5 rounded-md text-xs font-medium transition-colors ${showByCallStatus === 'failed' ? 'bg-red-50 border-red-200 text-red-800' : 'hover:bg-slate-50'}`}
              onClick={() => handleFilterByCallStatus('failed')}
            >
              Fallidas
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
