import React, { useState } from 'react';
import { useProspects } from '@/hooks/useProspects';
import { Prospect } from '@/services/prospectService';
import ProspectCard from './ProspectCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Loader2, Search, RefreshCw, Table, Grid, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { executeWebhook } from '@/components/call-center/utils/webhook';
import { incrementCallCount } from '@/services/leadService';
import ProspectsTable from './ProspectsTable';

export const ProspectsList: React.FC<{
  onViewDetails?: (prospect: Prospect) => void;
  onViewCalls?: (prospect: Prospect) => void;
  onValidate?: (prospect: Prospect) => void;
}> = ({ onViewDetails, onViewCalls, onValidate }) => {
  const [filter, setFilter] = useState<string | undefined>("Contacto Llamado"); // Default to "Contacto Llamado" status
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table'); // Default to table view
  const [showOnlyInterviewed, setShowOnlyInterviewed] = useState(false);
  const { prospects, loading, refetch } = useProspects(filter);
  const { toast } = useToast();
  const [refreshing, setRefreshing] = useState(false);
  
  // Improved filtering logic to detect duplicates based on lead_id, validated_lead_id, and phone numbers
  const uniqueProspects = prospects.reduce((unique: Prospect[], prospect) => {
    // First, normalize phone numbers for comparison by removing non-digit characters
    const normalizePhone = (phone: string | null): string => {
      if (!phone) return '';
      return phone.replace(/\D/g, '').slice(-10); // Get last 10 digits only
    };
    
    const prospectPhone = normalizePhone(prospect.lead_phone || prospect.phone_number_intl);
    
    // Check if we already have this prospect in our unique array
    const isDuplicate = unique.some(item => {
      // Same lead_id or validated_lead_id
      if ((prospect.lead_id && item.lead_id === prospect.lead_id) || 
          (prospect.validated_lead_id && item.validated_lead_id === prospect.validated_lead_id)) {
        return true;
      }
      
      // Same phone number (if available)
      if (prospectPhone && 
          (normalizePhone(item.lead_phone) === prospectPhone || 
           normalizePhone(item.phone_number_intl) === prospectPhone)) {
        return true;
      }
      
      // Same email (if available)
      if (prospect.lead_email && item.lead_email === prospect.lead_email && prospect.lead_email !== '') {
        return true;
      }
      
      return false;
    });
    
    if (!isDuplicate) {
      unique.push(prospect);
    }
    return unique;
  }, []);
  
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
  
  // Apply VAPI interview filter
  const filteredByVapi = uniqueProspects.filter(lead => {
    if (filter === "todos") return true;
    if (filter === "con_vapi") return (lead.call_count ?? 0) > 0;
    if (filter === "sin_vapi") return !lead.call_count || lead.call_count === 0;
    return true;
  });

  // Apply search filter and exclude "Validado" status prospects unless specifically filtered for
  const filteredLeads = filteredByVapi.filter(lead => {
    // Skip prospects with "Validado" status unless we're specifically filtering for them
    if (filter !== "Validado" && lead.lead_status === "Validado") return false;
    
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      lead.lead_name?.toLowerCase().includes(searchLower) || 
      lead.empresa?.toLowerCase().includes(searchLower) ||
      lead.contacto?.toLowerCase().includes(searchLower) ||
      lead.lead_name?.toLowerCase().includes(searchLower) || 
      lead.custodio_name?.toLowerCase().includes(searchLower) || 
      lead.lead_phone?.includes(searchLower) ||
      lead.phone_number_intl?.includes(searchLower)
    );
  });
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center space-x-4 w-full md:w-auto">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar prospecto..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Select 
            value={filter === undefined ? 'todos' : filter} 
            onValueChange={(value) => setFilter(value === 'todos' ? undefined : value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="Nuevo">Nuevos</SelectItem>
              <SelectItem value="Contactado">Contactados</SelectItem>
              <SelectItem value="Contacto Llamado">En Llamada</SelectItem>
              <SelectItem value="Calificado">Calificados</SelectItem>
              <SelectItem value="Validado">Validados</SelectItem>
              <SelectItem value="Rechazado">Rechazados</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
          <Button
            variant="outline"
            size="sm"
            className={`${!showOnlyInterviewed ? 'border-primary text-primary' : ''}`}
            onClick={() => setShowOnlyInterviewed(!showOnlyInterviewed)}
          >
            <Filter className="h-4 w-4 mr-1" />
            {showOnlyInterviewed ? 'Mostrar todos' : 'Solo entrevistados'}
          </Button>
          
          <div className="flex rounded-md border">
            <Button
              variant="ghost" 
              size="sm" 
              className={`px-3 ${viewMode === 'grid' ? 'bg-slate-100' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost" 
              size="sm" 
              className={`px-3 ${viewMode === 'table' ? 'bg-slate-100' : ''}`}
              onClick={() => setViewMode('table')}
            >
              <Table className="h-4 w-4" />
            </Button>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Actualizando..." : "Actualizar"}
          </Button>
        </div>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredProspects.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          {showOnlyInterviewed ? (
            <p>No se encontraron prospectos con entrevistas</p>
          ) : (
            <p>No se encontraron prospectos</p>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProspects.map((prospect) => (
            <ProspectCard 
              key={`prospect-${prospect.lead_id}-${prospect.validated_lead_id}`}
              prospect={prospect}
              onViewDetails={onViewDetails}
              onCall={handleCallProspect}
              onViewCalls={onViewCalls}
              onValidate={onValidate}
            />
          ))}
        </div>
      ) : (
        <ProspectsTable 
          prospects={filteredProspects} 
          onViewDetails={onViewDetails}
          onCall={handleCallProspect}
          onViewCalls={onViewCalls}
          onValidate={onValidate}
        />
      )}
    </div>
  );
};

export default ProspectsList;
