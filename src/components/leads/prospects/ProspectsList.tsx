
import React, { useState } from 'react';
import { Prospect } from '@/services/prospectService';
import { useProspects } from '@/hooks/useProspects';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, List, LayoutGrid, Filter } from 'lucide-react';
import ProspectCard from './ProspectCard';
import ProspectsTable from './ProspectsTable';
import { 
  ProspectFilters, 
  LoadingState, 
  EmptyState 
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
  
  // Filtrar por estado y opcionalmente por estado de llamada
  const filteredProspects = prospects
    .filter(prospect => !filterStatus || prospect.lead_status === filterStatus)
    .filter(prospect => !showOnlyInterviewed || prospect.transcript !== null)
    .filter(prospect => !showByCallStatus || prospect.ended_reason?.toLowerCase().includes(showByCallStatus.toLowerCase()));

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
        <div className="flex justify-between items-center">
          <ProspectFilters 
            searchQuery=""
            onSearchChange={() => {}}
            filter={filterStatus || undefined}
            onFilterChange={setFilterStatus} 
            showOnlyInterviewed={showOnlyInterviewed}
            onToggleInterviewed={() => setShowOnlyInterviewed(!showOnlyInterviewed)}
            viewMode={viewMode}
            onViewModeChange={handleViewModeChange}
            onRefresh={handleRefresh}
            refreshing={loading}
          />
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleViewModeChange('grid')}
              className={viewMode === 'grid' ? 'bg-slate-100' : ''}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleViewModeChange('table')}
              className={viewMode === 'table' ? 'bg-slate-100' : ''}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh} 
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
        
        {/* Filtros por estado de llamada */}
        <div className="flex space-x-2 overflow-x-auto pb-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleFilterByCallStatus(null)}
            className={!showByCallStatus ? 'bg-slate-100' : ''}
          >
            Todos
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleFilterByCallStatus('completed')}
            className={showByCallStatus === 'completed' ? 'bg-green-50 border-green-200 text-green-800' : ''}
          >
            Completadas
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleFilterByCallStatus('no-answer')}
            className={showByCallStatus === 'no-answer' ? 'bg-orange-50 border-orange-200 text-orange-800' : ''}
          >
            Sin respuesta
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleFilterByCallStatus('busy')}
            className={showByCallStatus === 'busy' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' : ''}
          >
            Ocupado
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleFilterByCallStatus('failed')}
            className={showByCallStatus === 'failed' ? 'bg-red-50 border-red-200 text-red-800' : ''}
          >
            Fallidas
          </Button>
        </div>
        
        {loading ? (
          <LoadingState />
        ) : filteredProspects.length === 0 ? (
          <EmptyState showOnlyInterviewed={showOnlyInterviewed} />
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProspects.map((prospect) => (
              <div key={`prospect-${prospect.lead_id}-${prospect.validated_lead_id}`} className="h-full">
                <ProspectCard
                  prospect={prospect}
                  onViewDetails={onViewDetails}
                  onCall={onCall}
                  onViewCalls={onViewCalls}
                  onValidate={onValidate}
                />
              </div>
            ))}
          </div>
        ) : (
          <Card className="shadow-sm">
            <ProspectsTable 
              prospects={filteredProspects} 
              onViewDetails={onViewDetails}
              onCall={onCall}
              onViewCalls={onViewCalls}
              onValidate={onValidate}
            />
          </Card>
        )}
      </div>
    </TooltipProvider>
  );
};

export default ProspectsList;
