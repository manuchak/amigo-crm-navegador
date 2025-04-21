
import React, { useState } from 'react';
import { useProspects } from '@/hooks/useProspects';
import { Prospect } from '@/services/prospectService';
import ProspectCard from './ProspectCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Loader2, Search, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { executeWebhook } from '@/components/call-center/utils/webhook';
import { incrementCallCount } from '@/services/leadService';

export const ProspectsList: React.FC = () => {
  const [filter, setFilter] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const { prospects, loading, refetch } = useProspects(filter);
  const { toast } = useToast();
  const [refreshing, setRefreshing] = useState(false);
  
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
  
  const handleViewDetails = (prospect: Prospect) => {
    // This would navigate to a prospect detail page
    console.log("View details for prospect:", prospect);
    toast({
      title: "Detalles del prospecto",
      description: "Función en desarrollo",
    });
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
  
  const filteredProspects = searchQuery.trim() === '' 
    ? prospects
    : prospects.filter(p => 
        (p.lead_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         p.custodio_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         p.lead_phone?.includes(searchQuery) ||
         p.phone_number_intl?.includes(searchQuery) ||
         p.car_brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         p.car_model?.toLowerCase().includes(searchQuery.toLowerCase()))
      );
  
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
          
          <Select onValueChange={(value) => setFilter(value === 'todos' ? undefined : value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="Nuevo">Nuevos</SelectItem>
              <SelectItem value="Contactado">Contactados</SelectItem>
              <SelectItem value="Calificado">Calificados</SelectItem>
              <SelectItem value="Rechazado">Rechazados</SelectItem>
            </SelectContent>
          </Select>
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
      
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredProspects.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <p>No se encontraron prospectos</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProspects.map((prospect) => (
            <ProspectCard 
              key={`prospect-${prospect.lead_id}-${prospect.validated_lead_id}`}
              prospect={prospect}
              onViewDetails={handleViewDetails}
              onCall={handleCallProspect}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProspectsList;
