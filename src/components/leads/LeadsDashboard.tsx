
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
import CallBatchDialog from './CallBatchDialog';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import LeadCreationForm from './LeadCreationForm';

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
        action: "outbound_call_batch_progressive"
      });
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
    await handleProgressiveBatchCall(sortedIds, onProgress);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <LeadStats stats={stats} />
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="default"
            onClick={() => setCreateLeadOpen(true)}
            className="flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            Crear Lead
          </Button>
          <Button
            size="sm"
            variant="subtle"
            onClick={() => setBatchDialogOpen(true)}
          >
            Llamadas Múltiples
          </Button>
        </div>
      </div>
      
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
      <Card className="shadow-sm border-slate-100">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="text-lg">Lista de Custodios</CardTitle>
              <CardDescription className="text-sm text-slate-500">
                {filteredLeads.length} custodios registrados
              </CardDescription>
            </div>
            
            <LeadFilters 
              filter={filter} 
              setFilter={setFilter} 
              onRefresh={handleRefreshData}
              isRefreshing={isRefreshing}
            />
          </div>
        </CardHeader>
        <CardContent>
          <LeadTable 
            leads={filteredLeads} 
            onCall={handleCall} 
            onViewCallLogs={handleViewCallLogs} 
          />
        </CardContent>
      </Card>

      {selectedLead && (
        <CallLogDialog
          open={isCallLogOpen}
          onOpenChange={setIsCallLogOpen}
          leadName={selectedLead.nombre}
          leadPhone={selectedLead.telefono}
          callLogs={callLogs}
          loading={loadingCallLogs}
        />
      )}
    </div>
  );
};

export default LeadsDashboard;
