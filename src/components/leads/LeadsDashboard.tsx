import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLeads } from '@/context/LeadsContext';
import { useToast } from '@/hooks/use-toast';
import { executeWebhook } from '../call-center/utils/webhook';
import { useCallHistory } from '../call-center/hooks/useCallHistory';
import CallLogDialog from './CallLogDialog';
import { 
  LeadStats,
  LeadFilters,
  LeadTable
} from './dashboard';
import { incrementCallCount } from '@/services/leadService';
import { useLeadCallLogs } from '@/hooks/lead-call-logs';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, PhoneCall, Filter, RefreshCw } from "lucide-react";
import LeadCreationForm from './LeadCreationForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CallBatchDialog } from './batch-calling';
import { processBatchCalls } from '@/hooks/lead-call-logs/batch-calls';

const LeadsDashboard = () => {
  const { leads, updateLeadStatus, refetchLeads } = useLeads();
  const { toast } = useToast();
  const [filter, setFilter] = useState("todos");
  const { getCallsForLead } = useCallHistory();
  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);
  const [isCallLogOpen, setIsCallLogOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [batchDialogOpen, setBatchDialogOpen] = useState(false);
  const [createLeadOpen, setCreateLeadOpen] = useState(false);
  const [filterExpanded, setFilterExpanded] = useState(false);
  const [view, setView] = useState<"list" | "cards">("list");
  
  const selectedLead = leads.find(lead => lead.id === selectedLeadId);
  
  const { callLogs, loading: loadingCallLogs } = useLeadCallLogs(
    selectedLeadId, 
    selectedLead?.telefono || null
  );
  
  const legacyCallLogs = selectedLeadId ? getCallsForLead(selectedLeadId) : [];
  
  const filteredLeads = filter === "todos" 
    ? leads 
    : leads.filter(lead => {
        if (filter === "armados") return lead.empresa.includes("armado");
        if (filter === "vehiculo") return lead.empresa.includes("vehículo");
        if (filter === "nuevos") return lead.estado === "Nuevo";
        if (filter === "contactados") return lead.estado === "Contactado" || lead.estado === "Contacto Llamado";
        return true;
      });
  
  const stats = {
    total: leads.length,
    nuevos: leads.filter(lead => lead.estado === "Nuevo").length,
    contactados: leads.filter(lead => lead.estado === "Contactado" || lead.estado === "Contacto Llamado").length,
    calificados: leads.filter(lead => lead.estado === "Calificado").length,
    rechazados: leads.filter(lead => lead.estado === "Rechazado").length,
  };

  // Calculate batch-eligible leads (new leads with phone numbers)
  const eligibleForBatch = leads.filter(
    lead => lead.estado === "Nuevo" && lead.telefono
  ).length;
  
  const handleCall = async (lead: any) => {
    try {
      let phoneNumber = lead.telefono || '';
      
      if (!phoneNumber) {
        toast({
          title: "Error",
          description: "No se encontró un número telefónico para este custodio",
          variant: "destructive",
        });
        return;
      }
      
      await updateLeadStatus(lead.id, "Contacto Llamado");
      
      try {
        await incrementCallCount(lead.id);
      } catch (error) {
        console.error("Error incrementing call count:", error);
      }
      
      await executeWebhook({
        telefono: phoneNumber,
        id: lead.id,
        nombre: lead.nombre,
        empresa: lead.empresa,
        contacto: lead.contacto,
        estado: "Contacto Llamado",
        fechaCreacion: lead.fechaCreacion,
        email: lead.email,
        tieneVehiculo: lead.tieneVehiculo,
        experienciaSeguridad: lead.experienciaSeguridad,
        esMilitar: lead.esMilitar,
        callCount: (lead.callCount || 0) + 1,
        lastCallDate: new Date().toISOString(),
        valor: lead.valor,
        timestamp: new Date().toISOString(),
        action: "outbound_call_requested"
      });
      
      toast({
        title: "Llamada iniciada",
        description: `Conectando con ${lead.nombre}...`,
      });
      
      await refetchLeads();
    } catch (error) {
      console.error("Error al iniciar llamada:", error);
      toast({
        title: "Error",
        description: "No se pudo iniciar la llamada",
        variant: "destructive",
      });
    }
  };
  
  const handleViewCallLogs = (leadId: number) => {
    setSelectedLeadId(leadId);
    setIsCallLogOpen(true);
  };
  
  const handleRefreshData = async () => {
    setIsRefreshing(true);
    try {
      await refetchLeads();
      toast({
        title: "Datos actualizados",
        description: "Se han cargado los datos más recientes",
      });
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast({
        title: "Error",
        description: "No se pudieron actualizar los datos",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  async function handleProgressiveBatchCall(leadIds: number[], onProgress?: (current: number, total: number) => void) {
    const BATCH_WEBHOOK_URL = "https://hook.us2.make.com/invpt3dzdm99q4ddckvke8x1x47ic9io";
    
    for (let i = 0; i < leadIds.length; i++) {
      const lead = leads.find(l => l.id === leadIds[i]);
      if (!lead) continue;
      
      let phoneNumber = lead.telefono || '';
      if (!phoneNumber && lead.contacto && lead.contacto.includes('|')) {
        const parts = lead.contacto.split('|');
        phoneNumber = parts[1]?.trim();
      }
      
      await updateLeadStatus(lead.id, "Contacto Llamado");
      
      try {
        await incrementCallCount(lead.id);
      } catch (error) {
        console.error("Error incrementing call count:", error);
      }
      
      // Send to the new webhook with complete lead data
      try {
        const response = await fetch(BATCH_WEBHOOK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            // Complete lead data
            lead_id: lead.id,
            nombre: lead.nombre,
            telefono: phoneNumber,
            empresa: lead.empresa,
            contacto: lead.contacto,
            estado: "Contacto Llamado",
            email: lead.email,
            fechaCreacion: lead.fechaCreacion,
            tieneVehiculo: lead.tieneVehiculo,
            experienciaSeguridad: lead.experienciaSeguridad,
            esMilitar: lead.esMilitar,
            modelovehiculo: lead.modelovehiculo,
            credencialsedena: lead.credencialsedena,
            anovehiculo: lead.anovehiculo,
            // Call metadata
            callCount: (lead.callCount || 0) + 1,
            lastCallDate: new Date().toISOString(),
            timestamp: new Date().toISOString(),
            action: "outbound_call_batch_progressive",
            batch_type: "progressive",
            batch_index: i + 1,
            batch_total: leadIds.length
          }),
        });
        
        if (!response.ok) {
          console.error(`Error sending to webhook: ${response.status}`);
        }
      } catch (error) {
        console.error("Error sending to webhook:", error);
      }
      
      if (onProgress) onProgress(i + 1, leadIds.length);
      await new Promise(res => setTimeout(res, 800));
    }
    
    await refetchLeads();
  }

  async function handlePredictiveBatchCall(leadIds: number[], onProgress?: (current: number, total: number) => void) {
    const sortedIds = [...leadIds].sort((a, b) => {
      const aLead = leads.find(l => l.id === a);
      const bLead = leads.find(l => l.id === b);
      return (new Date(aLead?.lastCallDate || 0).getTime() || 0) - (new Date(bLead?.lastCallDate || 0).getTime() || 0);
    });
    
    const BATCH_WEBHOOK_URL = "https://hook.us2.make.com/invpt3dzdm99q4ddckvke8x1x47ic9io";
    
    for (let i = 0; i < sortedIds.length; i++) {
      const lead = leads.find(l => l.id === sortedIds[i]);
      if (!lead) continue;
      
      let phoneNumber = lead.telefono || '';
      if (!phoneNumber && lead.contacto && lead.contacto.includes('|')) {
        const parts = lead.contacto.split('|');
        phoneNumber = parts[1]?.trim();
      }
      
      await updateLeadStatus(lead.id, "Contacto Llamado");
      
      try {
        await incrementCallCount(lead.id);
      } catch (error) {
        console.error("Error incrementing call count:", error);
      }
      
      // Send to the new webhook with complete lead data
      try {
        const response = await fetch(BATCH_WEBHOOK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            // Complete lead data
            lead_id: lead.id,
            nombre: lead.nombre,
            telefono: phoneNumber,
            empresa: lead.empresa,
            contacto: lead.contacto,
            estado: "Contacto Llamado",
            email: lead.email,
            fechaCreacion: lead.fechaCreacion,
            tieneVehiculo: lead.tieneVehiculo,
            experienciaSeguridad: lead.experienciaSeguridad,
            esMilitar: lead.esMilitar,
            modelovehiculo: lead.modelovehiculo,
            credencialsedena: lead.credencialsedena,
            anovehiculo: lead.anovehiculo,
            // Call metadata
            callCount: (lead.callCount || 0) + 1,
            lastCallDate: new Date().toISOString(),
            timestamp: new Date().toISOString(),
            action: "outbound_call_batch_predictive",
            batch_type: "predictive",
            batch_index: i + 1,
            batch_total: sortedIds.length,
            priorityScore: lead.lastCallDate ? ((new Date().getTime() - new Date(lead.lastCallDate).getTime()) / (1000 * 60 * 60 * 24)) : 100 // Days since last call as priority score
          }),
        });
        
        if (!response.ok) {
          console.error(`Error sending to webhook: ${response.status}`);
        }
      } catch (error) {
        console.error("Error sending to webhook:", error);
      }
      
      if (onProgress) onProgress(i + 1, sortedIds.length);
      await new Promise(res => setTimeout(res, 800));
    }
    
    await refetchLeads();
  }

  return (
    <div className="space-y-6">
      {/* Main Actions Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-lg shadow-sm border border-slate-100">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <PhoneCall className="h-5 w-5 text-primary" />
            Gestión de Llamadas
          </h2>
          <p className="text-sm text-slate-500">Organice y realice llamadas a sus custodios</p>
        </div>
        
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <Button
            size="sm"
            variant="default"
            className="flex-1 md:flex-none shadow-sm flex items-center gap-2 font-medium"
            onClick={() => setBatchDialogOpen(true)}
          >
            <PhoneCall className="h-4 w-4" />
            Llamadas Múltiples
            {eligibleForBatch > 0 && (
              <Badge variant="secondary" className="ml-1 bg-white text-primary">
                {eligibleForBatch}
              </Badge>
            )}
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => setCreateLeadOpen(true)}
            className="flex-1 md:flex-none flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Crear Lead
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={handleRefreshData}
            disabled={isRefreshing}
            className="flex items-center gap-1"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "Actualizando..." : "Actualizar"}
          </Button>
        </div>
      </div>
      
      {/* Stats Summary */}
      <LeadStats stats={stats} />
      
      <Dialog open={createLeadOpen} onOpenChange={setCreateLeadOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Lead</DialogTitle>
          </DialogHeader>
          <LeadCreationForm />
        </DialogContent>
      </Dialog>
      
      <CallBatchDialog
        open={batchDialogOpen}
        onOpenChange={setBatchDialogOpen}
        leads={leads}
        onProgressiveCall={handleProgressiveBatchCall}
        onPredictiveCall={handlePredictiveBatchCall}
      />

      {/* Leads Table Card with Tabs */}
      <Card className="shadow-sm border-slate-100">
        <CardHeader className="pb-0">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <div>
              <CardTitle className="text-lg">Lista de Custodios</CardTitle>
              <CardDescription className="text-sm text-slate-500">
                {filteredLeads.length} custodios registrados
              </CardDescription>
            </div>
            
            <div className="w-full md:w-auto flex flex-col md:flex-row gap-2 items-start md:items-center">
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex items-center gap-1"
                onClick={() => setFilterExpanded(!filterExpanded)}
              >
                <Filter className="h-4 w-4" />
                Filtros
              </Button>
              
              {filterExpanded && (
                <LeadFilters 
                  filter={filter} 
                  setFilter={setFilter} 
                  onRefresh={handleRefreshData}
                  isRefreshing={isRefreshing}
                />
              )}
            </div>
          </div>

          <Tabs defaultValue="list" className="mt-6">
            <TabsList>
              <TabsTrigger 
                value="list" 
                onClick={() => setView("list")}
                className="text-sm"
              >
                Vista de tabla
              </TabsTrigger>
              <TabsTrigger 
                value="cards" 
                onClick={() => setView("cards")}
                className="text-sm"
              >
                Vista de tarjetas
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>

        <CardContent className="pt-4">
          <LeadTable 
            leads={filteredLeads} 
            onCall={handleCall} 
            onViewCallLogs={handleViewCallLogs}
            view={view}
          />
        </CardContent>
      </Card>

      {selectedLead && (
        <CallLogDialog
          open={isCallLogOpen}
          onOpenChange={setIsCallLogOpen}
          leadName={selectedLead.nombre}
          leadPhone={selectedLead.telefono}
          leadId={selectedLeadId}
        />
      )}
    </div>
  );
};

export default LeadsDashboard;
