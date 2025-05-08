
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  Phone, 
  Check, 
  X, 
  Clock, 
  Calendar, 
  Filter, 
  UserPlus, 
  Loader2, 
  ArrowRight,
  Users,
  UserCheck,
  UserMinus
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useLeadInterviews } from '@/hooks/useLeadInterviews';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useLeadForm } from '@/components/leads/lead-form/useLeadForm';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { useAuth } from '@/context/auth/AuthContext';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';

// Helper function to get initials from name
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

export const LeadInitialInterview: React.FC = () => {
  const navigate = useNavigate();
  const { form, onSubmit } = useLeadForm();
  const [createLeadOpen, setCreateLeadOpen] = useState(false);
  const [classifyDialogOpen, setClassifyDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { currentUser } = useAuth();
  
  const {
    leads,
    newLeads,
    classifiedLeads,
    scheduledLeads,
    unassignedLeads,
    assignedLeads,
    myLeads,
    loading,
    filter,
    setFilter,
    updateLeadStatus,
    classifyLead,
    fetchLeads,
    assignLead,
    unassignLead,
    staffUsers,
    loadingStaff,
    isSupplyAdmin,
    isSupply
  } = useLeadInterviews();

  const handleOpenClassifyDialog = (leadId: number) => {
    setSelectedLeadId(leadId);
    setClassifyDialogOpen(true);
  };

  const handleOpenAssignDialog = (leadId: number) => {
    setSelectedLeadId(leadId);
    setSelectedStaffId(null);
    setAssignDialogOpen(true);
  };

  const handleClassify = async (type: 'armed' | 'vehicle') => {
    if (selectedLeadId) {
      await classifyLead(selectedLeadId, type);
      setClassifyDialogOpen(false);
      setSelectedLeadId(null);
    }
  };

  const handleAssign = async () => {
    if (selectedLeadId && selectedStaffId) {
      await assignLead(selectedLeadId, selectedStaffId);
      setAssignDialogOpen(false);
      setSelectedLeadId(null);
      setSelectedStaffId(null);
    }
  };

  const handleUnassign = async (leadId: number) => {
    await unassignLead(leadId);
  };

  const handleScheduleInterview = async (leadId: number) => {
    await updateLeadStatus(leadId, 'Agendado');
  };

  // Filter leads by search query
  const filteredBySearch = leads.filter(lead => {
    if (!searchQuery) return true;
    
    const searchLower = searchQuery.toLowerCase();
    return (
      (lead.nombre && lead.nombre.toLowerCase().includes(searchLower)) ||
      (lead.email && lead.email.toLowerCase().includes(searchLower)) ||
      (lead.telefono && lead.telefono.toLowerCase().includes(searchLower)) ||
      (lead.empresa && lead.empresa.toLowerCase().includes(searchLower))
    );
  });

  const selectedLead = selectedLeadId 
    ? leads.find(lead => lead.id === selectedLeadId) 
    : null;

  return (
    <div className="space-y-4">
      <Card className="border shadow-sm bg-white">
        <CardHeader className="pb-2">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <CardTitle className="text-xl font-semibold text-gray-800">Entrevista Inicial</CardTitle>
              <CardDescription className="text-gray-500">
                Clasificación y asignación de candidatos
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              {isSupplyAdmin && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => fetchLeads()}
                  className="h-9"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Actualizar
                </Button>
              )}
              <Button 
                size="sm" 
                className="bg-blue-600 hover:bg-blue-700 h-9"
                onClick={() => setCreateLeadOpen(true)}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Nuevo Candidato
              </Button>
            </div>
          </div>
          
          <div className="mt-4 flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Buscar candidato..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 max-w-md"
            />
            
            <Select 
              value={filter} 
              onValueChange={(value: any) => setFilter(value)}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filtrar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los candidatos</SelectItem>
                <SelectItem value="unassigned">Sin asignar</SelectItem>
                <SelectItem value="assigned">Asignados</SelectItem>
                <SelectItem value="armed">Custodio armado</SelectItem>
                <SelectItem value="vehicle">Con vehículo</SelectItem>
                {isSupply && (
                  <SelectItem value="mine">Mis candidatos</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
            </div>
          ) : (
            <>
              {filteredBySearch.length === 0 ? (
                <div className="text-center py-12 border rounded-md bg-gray-50">
                  <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-gray-700">No hay candidatos disponibles</h3>
                  <p className="text-gray-500 mt-1 max-w-md mx-auto">
                    No se encontraron candidatos que coincidan con los criterios de búsqueda actual.
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => {
                      setSearchQuery('');
                      setFilter('all');
                    }}
                  >
                    Limpiar filtros
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {isSupplyAdmin && filter === 'unassigned' && unassignedLeads.length > 0 && (
                    <div className="mb-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-md text-amber-700 flex items-center">
                      <UserMinus className="h-4 w-4 flex-shrink-0 mr-2" />
                      <span className="text-sm">
                        <span className="font-medium">{unassignedLeads.length}</span> candidatos sin asignar requieren atención
                      </span>
                    </div>
                  )}
                
                  <ScrollArea className="h-[600px] pr-4">
                    {filteredBySearch.map((lead) => (
                      <Card 
                        key={lead.id}
                        className="mb-3 overflow-hidden border-gray-100 hover:border-gray-300 transition-all"
                      >
                        <div className="p-4">
                          <div className="flex flex-col md:flex-row justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium text-gray-800 text-lg">
                                  {lead.nombre || 'Sin nombre'}
                                </h3>
                                
                                {lead.estado && (
                                  <Badge 
                                    variant="outline" 
                                    className={`
                                      ${lead.estado === 'Nuevo' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}
                                      ${lead.estado === 'Clasificado' ? 'bg-green-50 text-green-700 border-green-200' : ''}
                                      ${lead.estado === 'Agendado' ? 'bg-purple-50 text-purple-700 border-purple-200' : ''}
                                    `}
                                  >
                                    {lead.estado}
                                  </Badge>
                                )}
                              </div>
                              
                              <div className="text-sm text-gray-500 mt-1 space-y-1">
                                <div className="flex flex-wrap gap-x-4 gap-y-1">
                                  {lead.empresa && (
                                    <span>{lead.empresa}</span>
                                  )}
                                  {lead.email && (
                                    <span>{lead.email}</span>
                                  )}
                                  {lead.telefono && (
                                    <span>{lead.telefono}</span>
                                  )}
                                </div>
                                
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {lead.esarmado === 'SI' && (
                                    <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                                      Custodio Armado
                                    </Badge>
                                  )}
                                  
                                  {lead.tienevehiculo === 'SI' && (
                                    <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                                      Custodio con Vehículo
                                    </Badge>
                                  )}
                                  
                                  {lead.credencialsedena === 'SI' && (
                                    <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200">
                                      SEDENA
                                    </Badge>
                                  )}
                                  
                                  {lead.experienciaseguridad === 'SI' && (
                                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                                      Experiencia Seguridad
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                                {lead.created_at && (
                                  <span>
                                    Creado {formatDistanceToNow(new Date(lead.created_at), { locale: es })} atrás
                                  </span>
                                )}
                                
                                {lead.call_count > 0 && (
                                  <span>
                                    {lead.call_count} llamada{lead.call_count !== 1 ? 's' : ''}
                                  </span>
                                )}
                                
                                {lead.assigned_to && lead.assignee_name && (
                                  <div className="flex items-center gap-1.5">
                                    <UserCheck className="h-3.5 w-3.5" />
                                    <span>Asignado a: {lead.assignee_name}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex flex-wrap gap-2 items-start">
                              {!lead.assigned_to && isSupplyAdmin && (
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="h-9"
                                  onClick={() => handleOpenAssignDialog(lead.id)}
                                >
                                  <UserCheck className="h-3.5 w-3.5 mr-1.5" />
                                  Asignar
                                </Button>
                              )}
                              
                              {lead.assigned_to && isSupplyAdmin && (
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="h-9 border-red-200 text-red-600 hover:bg-red-50"
                                  onClick={() => handleUnassign(lead.id)}
                                >
                                  <UserMinus className="h-3.5 w-3.5 mr-1.5" />
                                  Desasignar
                                </Button>
                              )}
                              
                              {isSupply && !lead.esarmado && !lead.tienevehiculo && (
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="h-9"
                                  onClick={() => handleOpenClassifyDialog(lead.id)}
                                >
                                  <Filter className="h-3.5 w-3.5 mr-1.5" />
                                  Clasificar
                                </Button>
                              )}
                              
                              {isSupply && (lead.esarmado === 'SI' || lead.tienevehiculo === 'SI') && (
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="h-9"
                                  onClick={() => handleScheduleInterview(lead.id)}
                                >
                                  <Calendar className="h-3.5 w-3.5 mr-1.5" />
                                  Agendar
                                </Button>
                              )}
                              
                              <Button 
                                size="sm"
                                variant="default"
                                className="h-9 bg-blue-600 hover:bg-blue-700"
                              >
                                <Phone className="h-3.5 w-3.5 mr-1.5" />
                                Llamar
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </ScrollArea>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Classification Dialog */}
      <Dialog open={classifyDialogOpen} onOpenChange={setClassifyDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Clasificar Candidato</DialogTitle>
            <DialogDescription>
              Seleccione el tipo de custodio para este candidato
            </DialogDescription>
          </DialogHeader>
          
          {selectedLead && (
            <div className="mb-4 p-3 bg-slate-50 rounded-lg">
              <h4 className="font-medium">{selectedLead.nombre || 'Sin nombre'}</h4>
              <p className="text-sm text-slate-600">
                {selectedLead.email && `${selectedLead.email} · `}
                {selectedLead.telefono}
              </p>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <Button 
              onClick={() => handleClassify('armed')}
              className="h-auto py-6 flex flex-col bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200"
              variant="outline"
            >
              <div className="text-blue-600 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 7a2.11 2.11 0 0 1 1.66 1.97 2.33 2.33 0 0 1-.4 1.5 2.39 2.39 0 0 1 .4 1.5A2.1 2.1 0 0 1 19 14h-5.5"></path><path d="M7 7a2.11 2.11 0 0 0-1.66 1.97 2.33 2.33 0 0 0 .4 1.5 2.39 2.39 0 0 0-.4 1.5A2.1 2.1 0 0 0 7 14h5.5"></path><path d="M12 22v-4.5"></path><path d="M10 22h4"></path><path d="M3 10v3h7l1-2a2.11 2.11 0 0 1 3 0l1 2h7v-3"></path></svg>
              </div>
              <span>Custodio Armado</span>
            </Button>
            <Button 
              onClick={() => handleClassify('vehicle')}
              className="h-auto py-6 flex flex-col bg-green-50 hover:bg-green-100 text-green-800 border border-green-200"
              variant="outline"
            >
              <div className="text-green-600 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.6-1.2-.9-1.9-.9H6c-.7 0-1.5.6-1.8 1.2L3 11H2c-.5 0-1 .4-1 1v4c0 .6.5 1 1 1h2"></path><circle cx="7" cy="17" r="2"></circle><circle cx="17" cy="17" r="2"></circle></svg>
              </div>
              <span>Custodio con Vehículo</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assign Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Asignar Candidato</DialogTitle>
            <DialogDescription>
              Seleccione el miembro del equipo Supply para asignar este candidato
            </DialogDescription>
          </DialogHeader>
          
          {selectedLead && (
            <div className="mb-4 p-3 bg-slate-50 rounded-md">
              <h4 className="font-medium">{selectedLead.nombre || 'Sin nombre'}</h4>
              <p className="text-sm text-gray-500">
                {selectedLead.email && `${selectedLead.email} · `}
                {selectedLead.telefono}
              </p>
            </div>
          )}
          
          {loadingStaff ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />
            </div>
          ) : (
            <div className="space-y-4 my-2">
              <div className="grid grid-cols-1 gap-3">
                {staffUsers.map(user => (
                  <button
                    key={user.uid}
                    type="button"
                    onClick={() => setSelectedStaffId(user.uid)}
                    className={`flex items-center gap-3 p-3 rounded-md transition-colors w-full text-left ${
                      selectedStaffId === user.uid
                        ? 'bg-blue-50 border border-blue-200'
                        : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <Avatar className="h-9 w-9 bg-blue-100 text-blue-600">
                      <AvatarFallback>
                        {getInitials(user.displayName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{user.displayName}</div>
                      <div className="text-xs text-gray-500">{user.role}</div>
                    </div>
                    {selectedStaffId === user.uid && (
                      <Check className="h-5 w-5 text-blue-600" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <DialogFooter className="mt-4 gap-2">
            <Button
              variant="outline"
              onClick={() => setAssignDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAssign}
              disabled={!selectedStaffId || loadingStaff}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Asignar Candidato
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Create Lead Dialog */}
      <Dialog open={createLeadOpen} onOpenChange={setCreateLeadOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Candidato</DialogTitle>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-6">
            {/* Form implementation from useLeadForm */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-slate-700">Información Personal</h3>
                {/* Form fields would be here */}
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setCreateLeadOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">Guardar Candidato</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
