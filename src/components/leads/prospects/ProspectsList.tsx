
import React, { useState } from 'react';
import { useProspects } from '@/hooks/useProspects';
import { Prospect } from '@/services/prospectService';
import { useToast } from '@/hooks/use-toast';
import { executeWebhook } from '@/components/call-center/utils/webhook';
import { incrementCallCount } from '@/services/leadService';
import { ProspectFilters, ProspectsContent } from './components';
import { useProspectFilters } from './hooks';

export const ProspectsList: React.FC<{
  onViewDetails?: (prospect: Prospect) => void;
  onViewCalls?: (prospect: Prospect) => void;
  onValidate?: (prospect: Prospect) => void;
}> = ({ onViewDetails, onViewCalls, onValidate }) => {
  const [refreshing, setRefreshing] = useState(false);
  const { prospects, loading, refetch } = useProspects(undefined);
  const { toast } = useToast();
  
  const {
    filterState,
    setFilter,
    setSearchQuery,
    setViewMode,
    toggleInterviewed,
    filteredLeads
  } = useProspectFilters(prospects);
  
  const handleCallProspect = async (prospect: Prospect) => {
    if (!prospect.lead_id || !prospect.lead_phone) {
      toast({
        title: "Error",
        description: "No se puede llamar a este prospecto porque faltan datos",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Increment call count if possible
      if (prospect.lead_id) {
        await incrementCallCount(prospect.lead_id);
      }
      
      // Execute webhook to initiate call
      await executeWebhook({
        telefono: prospect.lead_phone,
        id: prospect.lead_id,
        nombre: prospect.lead_name || prospect.custodio_name,
        estado: "Contacto Llamado",
        timestamp: new Date().toISOString(),
        action: "outbound_call_requested",
        car_brand: prospect.car_brand,
        car_model: prospect.car_model,
        car_year: prospect.car_year,
        security_exp: prospect.security_exp,
        sedena_id: prospect.sedena_id
      });
      
      toast({
        title: "Llamada iniciada",
        description: `Llamando a ${prospect.lead_name || prospect.custodio_name || 'prospecto'}...`,
      });
      
      // Refresh prospects data after call is initiated
      await refetch();
    } catch (error) {
      console.error("Error initiating call:", error);
      toast({
        title: "Error",
        description: "No se pudo iniciar la llamada",
        variant: "destructive",
      });
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
      toast({
        title: "Datos actualizados",
        description: "Los prospectos se han actualizado correctamente",
      });
    } catch (error) {
      console.error("Error refreshing prospects:", error);
      toast({
        title: "Error",
        description: "No se pudieron actualizar los datos",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <ProspectFilters
        searchQuery={filterState.searchQuery}
        onSearchChange={setSearchQuery}
        filter={filterState.filter}
        onFilterChange={setFilter}
        showOnlyInterviewed={filterState.showOnlyInterviewed}
        onToggleInterviewed={toggleInterviewed}
        viewMode={filterState.viewMode}
        onViewModeChange={setViewMode}
        onRefresh={handleRefresh}
        refreshing={refreshing}
      />
      
      <ProspectsContent
        loading={loading}
        prospects={filteredLeads}
        showOnlyInterviewed={filterState.showOnlyInterviewed}
        viewMode={filterState.viewMode}
        onViewDetails={onViewDetails}
        onCall={handleCallProspect}
        onViewCalls={onViewCalls}
        onValidate={onValidate}
      />
    </div>
  );
};

export default ProspectsList;
