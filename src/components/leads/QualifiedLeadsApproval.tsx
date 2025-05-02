
import React, { useState, useEffect } from 'react';
import { useLeads } from '@/context/LeadsContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Check, X, Search, UserCheck, Filter, Clock, RefreshCw, Shield } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ValidationDialog } from './validation/ValidationDialog';
import { ValidationStatsCards } from './validation/ValidationStatsCards';
import { useValidation } from './validation/useValidation';
import { VapiInterviewFilter } from './filters/VapiInterviewFilter';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import LeadStatusBadge from './dashboard/LeadStatusBadge';

const QualifiedLeadsApproval = () => {
  const { leads, updateLeadStatus, refetchLeads } = useLeads();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);
  const [isValidationOpen, setIsValidationOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [vapiFilter, setVapiFilter] = useState("todos");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const { stats, statsLoading } = useValidation();
  
  // Filter leads based on status (Qualified or Validated)
  const filteredByStatus = leads.filter(lead => {
    if (statusFilter === "todos") return lead.estado === 'Calificado' || lead.estado === 'Validado';
    return lead.estado === statusFilter;
  });
  
  // Apply VAPI interview filter
  const filteredByVapi = filteredByStatus.filter(lead => {
    if (vapiFilter === "todos") return true;
    if (vapiFilter === "con_vapi") return (lead.callCount ?? 0) > 0;
    if (vapiFilter === "sin_vapi") return !lead.callCount || lead.callCount === 0;
    return true;
  });

  // Apply search filter if any
  const filteredLeads = filteredByVapi.filter(lead => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      lead.nombre.toLowerCase().includes(searchLower) || 
      lead.empresa.toLowerCase().includes(searchLower) ||
      lead.contacto.toLowerCase().includes(searchLower)
    );
  });

  const handleApprove = (leadId: number) => {
    updateLeadStatus(leadId, 'Aprobado');
    toast.success('Lead aprobado correctamente');
  };

  const handleReject = (leadId: number) => {
    updateLeadStatus(leadId, 'Rechazado');
    toast.error('Lead rechazado');
  };
  
  const handleValidate = (leadId: number) => {
    setSelectedLeadId(leadId);
    setIsValidationOpen(true);
  };
  
  const handleValidationComplete = (status: 'approved' | 'rejected') => {
    if (!selectedLeadId) return;
    updateLeadStatus(
      selectedLeadId, 
      status === 'approved' ? 'Aprobado' : 'Rechazado'
    );
    setIsValidationOpen(false);
    setSelectedLeadId(null);
    if (status === 'approved') {
      toast.success('Custodio aprobado correctamente');
    } else {
      toast.error('Custodio rechazado');
    }
  };
  
  const handleRefreshData = async () => {
    setIsRefreshing(true);
    try {
      await refetchLeads();
      toast.success("Datos actualizados");
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast.error("No se pudieron actualizar los datos");
    } finally {
      setIsRefreshing(false);
    }
  };
  
  const selectedLead = leads.find(lead => lead.id === selectedLeadId);

  return (
    <div className="space-y-6">
      {/* Performance Stats Cards */}
      <ValidationStatsCards stats={stats} loading={statsLoading} />
      
      <Card className="bg-white shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5 text-blue-600" />
                Validación de Custodios
              </CardTitle>
              <CardDescription>
                Revisa y valida a los custodios que han sido calificados o validados previamente
              </CardDescription>
            </div>
            
            <div className="flex flex-wrap mt-4 md:mt-0 w-full md:w-auto gap-2">
              {/* Status filter */}
              <Select 
                value={statusFilter} 
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="Calificado">Calificados</SelectItem>
                  <SelectItem value="Validado">Validados</SelectItem>
                </SelectContent>
              </Select>
              
              {/* VAPI Interview filter */}
              <VapiInterviewFilter value={vapiFilter} onChange={setVapiFilter} />
              
              {/* Search box */}
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar custodios..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Button 
                variant="outline" 
                size="icon"
                onClick={handleRefreshData}
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredLeads.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <UserCheck className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-4 text-lg">No hay custodios pendientes de aprobación</p>
              <p className="text-sm text-muted-foreground">
                Los custodios calificados o validados aparecerán aquí para su revisión final
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Nombre</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Llamadas</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.map((lead) => (
                  <TableRow key={lead.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{lead.nombre}</TableCell>
                    <TableCell>
                      {lead.empresa}
                      {lead.empresa.includes("armado") && (
                        <Badge variant="destructive" className="ml-2">Armado</Badge>
                      )}
                      {lead.empresa.includes("vehículo") && (
                        <Badge variant="secondary" className="ml-2">Vehículo</Badge>
                      )}
                    </TableCell>
                    <TableCell>{lead.contacto}</TableCell>
                    <TableCell>
                      <LeadStatusBadge status={lead.estado} />
                    </TableCell>
                    <TableCell>{lead.fechaCreacion}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-blue-50">
                        {lead.callCount || 0}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button 
                          onClick={() => handleValidate(lead.id)} 
                          variant="outline" 
                          size="sm"
                          className="bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200"
                        >
                          <Shield className="mr-1 h-4 w-4" />
                          Validar
                        </Button>
                        <Button 
                          onClick={() => handleApprove(lead.id)} 
                          variant="outline" 
                          size="sm"
                          className="bg-green-50 text-green-600 hover:bg-green-100 border-green-200"
                        >
                          <Check className="mr-1 h-4 w-4" />
                          Aprobar
                        </Button>
                        <Button 
                          onClick={() => handleReject(lead.id)} 
                          variant="outline" 
                          size="sm"
                          className="bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
                        >
                          <X className="mr-1 h-4 w-4" />
                          Rechazar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      {/* Validation Dialog */}
      {selectedLead && (
        <ValidationDialog
          open={isValidationOpen}
          onOpenChange={setIsValidationOpen}
          leadId={selectedLead.id}
          leadName={selectedLead.nombre}
          leadPhone={selectedLead.telefono}
          onValidationComplete={handleValidationComplete}
        />
      )}
    </div>
  );
};

export default QualifiedLeadsApproval;
