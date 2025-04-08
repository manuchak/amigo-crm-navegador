
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { PhoneCall, ClipboardList, Filter, Phone, RefreshCw } from 'lucide-react';
import { useLeads } from '@/context/LeadsContext';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { executeWebhook } from '../call-center/utils/webhook';
import { useCallHistory } from '../call-center/hooks/useCallHistory';
import { HoverCard, HoverCardTrigger, HoverCardContent } from '@/components/ui/hover-card';
import CallLogDialog from './CallLogDialog';

const LeadsDashboard = () => {
  const { leads, updateLeadStatus, refetchLeads } = useLeads();
  const { toast } = useToast();
  const [filter, setFilter] = useState("todos");
  const { getCallsForLead } = useCallHistory();
  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);
  const [isCallLogOpen, setIsCallLogOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const filteredLeads = filter === "todos" 
    ? leads 
    : leads.filter(lead => {
        if (filter === "armados") return lead.empresa.includes("armado");
        if (filter === "vehiculo") return lead.empresa.includes("vehículo");
        if (filter === "nuevos") return lead.estado === "Nuevo";
        if (filter === "contactados") return lead.estado === "Contactado";
        return true;
      });
  
  const stats = {
    total: leads.length,
    nuevos: leads.filter(lead => lead.estado === "Nuevo").length,
    contactados: leads.filter(lead => lead.estado === "Contactado").length,
    calificados: leads.filter(lead => lead.estado === "Calificado").length,
    rechazados: leads.filter(lead => lead.estado === "Rechazado").length,
  };
  
  const handleCall = async (lead: any) => {
    try {
      // Use telefono property directly from the lead
      let phoneNumber = lead.telefono || '';
      
      if (!phoneNumber) {
        toast({
          title: "Error",
          description: "No se encontró un número telefónico para este custodio",
          variant: "destructive",
        });
        return;
      }
      
      await executeWebhook({
        telefono: phoneNumber,
        id: lead.id,
        nombre: lead.nombre,
        empresa: lead.empresa,
        contacto: lead.contacto,
        estado: lead.estado,
        fechaCreacion: lead.fechaCreacion,
        email: lead.email,
        tieneVehiculo: lead.tieneVehiculo,
        experienciaSeguridad: lead.experienciaSeguridad,
        esMilitar: lead.esMilitar,
        callCount: lead.callCount || 0,
        lastCallDate: lead.lastCallDate,
        valor: lead.valor,
        timestamp: new Date().toISOString(),
        action: "outbound_call_requested"
      });
      
      updateLeadStatus(lead.id, "1er Contacto");
      
      toast({
        title: "Llamada iniciada",
        description: `Conectando con ${lead.nombre}...`,
      });
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
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Nuevo": return "info";
      case "Contactado": return "warning";
      case "1er Contacto": return "warning";
      case "Calificado": return "success";
      case "Rechazado": return "destructive";
      default: return "secondary";
    }
  };

  const selectedLead = leads.find(lead => lead.id === selectedLeadId);
  const callLogs = selectedLeadId ? getCallsForLead(selectedLeadId) : [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2">
        <Card className="shadow-sm border-slate-100">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs text-slate-500">Total de Leads</CardDescription>
            <CardTitle className="text-2xl font-light">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="shadow-sm border-slate-100">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs text-slate-500">Nuevos</CardDescription>
            <CardTitle className="text-2xl font-light">{stats.nuevos}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="shadow-sm border-slate-100">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs text-slate-500">Contactados</CardDescription>
            <CardTitle className="text-2xl font-light">{stats.contactados}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="shadow-sm border-slate-100">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs text-slate-500">Calificados</CardDescription>
            <CardTitle className="text-2xl font-light">{stats.calificados}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="shadow-sm border-slate-100">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs text-slate-500">Rechazados</CardDescription>
            <CardTitle className="text-2xl font-light">{stats.rechazados}</CardTitle>
          </CardHeader>
        </Card>
      </div>
      
      <Card className="shadow-sm border-slate-100">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="text-lg">Lista de Custodios</CardTitle>
              <CardDescription className="text-sm text-slate-500">
                {filteredLeads.length} custodios registrados
              </CardDescription>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefreshData}
                disabled={isRefreshing}
                className="border-slate-200"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Actualizar
              </Button>
              
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-slate-400" />
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="w-[180px] border-slate-200 text-sm">
                    <SelectValue placeholder="Filtrar por" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="armados">Armados</SelectItem>
                    <SelectItem value="vehiculo">Con vehículo</SelectItem>
                    <SelectItem value="nuevos">Nuevos</SelectItem>
                    <SelectItem value="contactados">Contactados</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-slate-100">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 hover:bg-slate-100">
                  <TableHead className="text-xs font-medium text-slate-500">Nombre</TableHead>
                  <TableHead className="text-xs font-medium text-slate-500">Categoría</TableHead>
                  <TableHead className="text-xs font-medium text-slate-500">Email</TableHead>
                  <TableHead className="text-xs font-medium text-slate-500">Teléfono</TableHead>
                  <TableHead className="text-xs font-medium text-slate-500">Estado</TableHead>
                  <TableHead className="text-xs font-medium text-slate-500">Llamadas</TableHead>
                  <TableHead className="text-xs font-medium text-slate-500">Última Llamada</TableHead>
                  <TableHead className="text-xs font-medium text-slate-500">Fecha Creación</TableHead>
                  <TableHead className="text-right text-xs font-medium text-slate-500">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-slate-400">
                      No hay custodios registrados
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLeads.map((lead) => (
                    <TableRow key={lead.id} className="hover:bg-slate-50">
                      <TableCell className="font-medium">{lead.nombre}</TableCell>
                      <TableCell className="text-sm text-slate-600">{lead.empresa}</TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {lead.email || <span className="text-slate-400">Sin email</span>}
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {lead.telefono ? (
                          <div className="flex items-center">
                            <Phone className="h-3 w-3 mr-1 text-slate-400" />
                            {lead.telefono}
                          </div>
                        ) : (
                          <span className="text-slate-400">Sin teléfono</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(lead.estado)} className="font-normal">
                          {lead.estado}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <HoverCard>
                          <HoverCardTrigger asChild>
                            <div className="flex items-center">
                              <Badge variant="outline" className="cursor-pointer bg-slate-50 border-slate-200 text-slate-700">
                                <Phone className="h-3 w-3 mr-1" />
                                {lead.callCount || 0}
                              </Badge>
                            </div>
                          </HoverCardTrigger>
                          <HoverCardContent className="w-80">
                            <div className="flex justify-between space-x-4">
                              <div className="space-y-1">
                                <h4 className="text-sm font-semibold">Historial de llamadas</h4>
                                <p className="text-sm text-slate-500">
                                  Se han realizado {lead.callCount || 0} intentos de llamada a este custodio.
                                </p>
                                <p className="text-xs text-slate-400">
                                  Haz clic en "Detalles" para ver el registro completo.
                                </p>
                              </div>
                            </div>
                          </HoverCardContent>
                        </HoverCard>
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">{lead.lastCallDate || 'No hay llamadas'}</TableCell>
                      <TableCell className="text-sm text-slate-600">{lead.fechaCreacion}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleCall(lead)}
                            className="text-slate-700 hover:text-primary"
                          >
                            <PhoneCall className="h-4 w-4 mr-1" />
                            Llamar
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleViewCallLogs(lead.id)}
                            className="text-slate-700 hover:text-primary"
                          >
                            <ClipboardList className="h-4 w-4 mr-1" />
                            Detalles
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {selectedLead && (
        <CallLogDialog
          open={isCallLogOpen}
          onOpenChange={setIsCallLogOpen}
          leadName={selectedLead.nombre}
          callLogs={callLogs}
        />
      )}
    </div>
  );
};

export default LeadsDashboard;
