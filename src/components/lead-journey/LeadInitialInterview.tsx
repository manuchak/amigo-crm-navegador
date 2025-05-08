
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Phone, Check, X, Clock, Calendar, Filter, UserPlus, Loader2, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useLeadInterviews } from '@/hooks/useLeadInterviews';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useLeadForm } from '@/components/leads/lead-form/useLeadForm';

export const LeadInitialInterview: React.FC = () => {
  const navigate = useNavigate();
  const { form, onSubmit } = useLeadForm();
  const [createLeadOpen, setCreateLeadOpen] = useState(false);
  const [classifyDialogOpen, setClassifyDialogOpen] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);
  
  const {
    leads,
    newLeads,
    classifiedLeads,
    scheduledLeads,
    loading,
    filter,
    setFilter,
    updateLeadStatus,
    classifyLead,
    fetchLeads
  } = useLeadInterviews();

  const handleOpenClassifyDialog = (leadId: number) => {
    setSelectedLeadId(leadId);
    setClassifyDialogOpen(true);
  };

  const handleClassify = async (type: 'armed' | 'vehicle') => {
    if (selectedLeadId) {
      await classifyLead(selectedLeadId, type);
      setClassifyDialogOpen(false);
      setSelectedLeadId(null);
    }
  };

  const handleScheduleInterview = async (leadId: number) => {
    await updateLeadStatus(leadId, 'Agendado');
  };

  const selectedLead = selectedLeadId 
    ? leads.find(lead => lead.id === selectedLeadId) 
    : null;

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Entrevista Inicial</CardTitle>
              <CardDescription className="mt-1.5">
                Primera etapa del proceso de selección - Clasificación de candidatos
              </CardDescription>
            </div>
            <Button 
              size="sm" 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => setCreateLeadOpen(true)}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Nuevo Candidato
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100 mb-6">
            <h3 className="text-blue-800 font-medium flex items-center">
              <Filter className="h-4 w-4 mr-2" />
              Proceso de Clasificación
            </h3>
            <p className="text-sm text-slate-600 mt-2">
              En la entrevista inicial, se evalúa brevemente a los candidatos para clasificarlos según su perfil y experiencia:
            </p>
            <ul className="mt-3 space-y-2">
              <li className="text-sm text-slate-700 flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                <span><span className="font-medium">Custodio Armado:</span> Candidatos con experiencia militar/policial y credencial SEDENA</span>
              </li>
              <li className="text-sm text-slate-700 flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                <span><span className="font-medium">Custodio con Vehículo:</span> Candidatos con vehículo propio y experiencia en conducción</span>
              </li>
            </ul>
          </div>
          
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger 
                value="all" 
                onClick={() => setFilter('all')}
              >
                Todos los Candidatos 
                <Badge className="ml-2 bg-slate-100 text-slate-600">{leads.length}</Badge>
              </TabsTrigger>
              <TabsTrigger 
                value="armed" 
                onClick={() => setFilter('armed')}
              >
                Candidatos para Custodio Armado
              </TabsTrigger>
              <TabsTrigger 
                value="vehicle" 
                onClick={() => setFilter('vehicle')}
              >
                Candidatos para Custodio con Vehículo
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="animate-fade-in">
              {loading ? (
                <div className="flex justify-center items-center p-8">
                  <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-slate-50 p-3 border-b flex justify-between items-center">
                    <h3 className="font-medium text-slate-700">Candidatos a clasificar</h3>
                    <div className="flex items-center gap-2 text-xs">
                      <Badge variant="outline" className="bg-slate-50">{newLeads.length} Pendientes</Badge>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">{classifiedLeads.length} Clasificados</Badge>
                    </div>
                  </div>
                  
                  {leads.length === 0 ? (
                    <div className="p-8 text-center">
                      <p className="text-slate-500">No hay candidatos disponibles.</p>
                      <Button 
                        variant="outline" 
                        className="mt-4"
                        onClick={() => setCreateLeadOpen(true)}
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Añadir Candidato
                      </Button>
                    </div>
                  ) : (
                    <div className="divide-y max-h-[500px] overflow-y-auto">
                      {/* New/unclassified leads */}
                      {newLeads.map(lead => (
                        <div key={lead.id} className="p-4 hover:bg-slate-50 transition-colors">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-slate-800">{lead.nombre || 'Sin nombre'}</h4>
                              <div className="text-sm text-slate-500 mt-1">
                                {lead.empresa || 'Sin información'} · {lead.email && `${lead.email} · `}
                                {lead.telefono && `${lead.telefono}`}
                              </div>
                              <div className="flex flex-wrap items-center gap-2 mt-2">
                                <Badge variant="outline" className="bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200">
                                  {lead.estado || "Nuevo"}
                                </Badge>
                                {lead.experienciaseguridad === 'SI' && (
                                  <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200">
                                    Experiencia en Seguridad
                                  </Badge>
                                )}
                                {lead.tienevehiculo === 'SI' && (
                                  <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200">
                                    Tiene Vehículo
                                  </Badge>
                                )}
                                {lead.created_at && (
                                  <span className="text-xs text-slate-400">
                                    Creado hace {formatDistanceToNow(new Date(lead.created_at), { locale: es })}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-8 gap-1"
                                onClick={() => handleOpenClassifyDialog(lead.id)}
                              >
                                <Filter className="h-3.5 w-3.5" />
                                <span>Clasificar</span>
                              </Button>
                              <Button 
                                size="sm" 
                                className="h-8 gap-1 bg-blue-600 hover:bg-blue-700"
                              >
                                <Phone className="h-3.5 w-3.5" />
                                <span>Llamar</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {/* Classified leads */}
                      {classifiedLeads.map(lead => (
                        <div key={lead.id} className="p-4 hover:bg-slate-50 transition-colors">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-slate-800">{lead.nombre || 'Sin nombre'}</h4>
                              <div className="text-sm text-slate-500 mt-1">
                                {lead.empresa || 'Sin información'} · {lead.email && `${lead.email} · `}
                                {lead.telefono && `${lead.telefono}`}
                              </div>
                              <div className="flex flex-wrap items-center gap-2 mt-2">
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200">
                                  Clasificado
                                </Badge>
                                {lead.esarmado === 'SI' && (
                                  <Badge variant="outline" className="bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200">
                                    Custodio Armado
                                  </Badge>
                                )}
                                {lead.tienevehiculo === 'SI' && (
                                  <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200">
                                    Custodio con Vehículo
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-8 gap-1"
                                onClick={() => handleScheduleInterview(lead.id)}
                              >
                                <Calendar className="h-3.5 w-3.5" />
                                <span>Agendar</span>
                              </Button>
                              <Button 
                                size="sm"
                                variant="default"
                                className="h-8 gap-1"
                                onClick={() => navigate(`/lead-journey/validation`)}
                              >
                                <ArrowRight className="h-3.5 w-3.5" />
                                <span>Validación</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {/* Scheduled leads */}
                      {scheduledLeads.map(lead => (
                        <div key={lead.id} className="p-4 bg-slate-50">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-slate-800">{lead.nombre || 'Sin nombre'}</h4>
                              <div className="text-sm text-slate-500 mt-1">
                                {lead.empresa || 'Sin información'} · {lead.email && `${lead.email} · `}
                                {lead.telefono && `${lead.telefono}`}
                              </div>
                              <div className="flex flex-wrap items-center gap-2 mt-2">
                                <Badge variant="outline" className="bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200">
                                  <Clock className="h-3 w-3 mr-1" /> 
                                  Entrevista Agendada
                                </Badge>
                                {lead.esarmado === 'SI' && (
                                  <Badge variant="outline" className="bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200">
                                    Custodio Armado
                                  </Badge>
                                )}
                                {lead.tienevehiculo === 'SI' && (
                                  <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200">
                                    Custodio con Vehículo
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-8 gap-1 border-slate-200"
                              >
                                <span>Pendiente</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="armed" className="animate-fade-in">
              <div className="space-y-4">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <h3 className="text-blue-800 font-medium">Criterios de Clasificación - Custodio Armado</h3>
                  <ul className="mt-2 space-y-1">
                    <li className="text-sm text-slate-700 flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      Experiencia con armas y portación de licencias
                    </li>
                    <li className="text-sm text-slate-700 flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      Antecedentes militares o policiales
                    </li>
                    <li className="text-sm text-slate-700 flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      Verificación de credencial SEDENA
                    </li>
                    <li className="text-sm text-slate-700 flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      Evaluación básica de temperamento
                    </li>
                  </ul>
                </div>
                
                {/* Filtered list for armed candidates */}
                {loading ? (
                  <div className="flex justify-center items-center p-8">
                    <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                  </div>
                ) : (
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-slate-50 p-3 border-b">
                      <h3 className="font-medium text-slate-700">Candidatos para Custodio Armado</h3>
                    </div>
                    
                    {leads.filter(lead => lead.esarmado === 'SI' || lead.empresa?.includes('armado')).length === 0 ? (
                      <div className="p-8 text-center">
                        <p className="text-slate-500">No hay candidatos para Custodio Armado.</p>
                      </div>
                    ) : (
                      <div className="divide-y max-h-[500px] overflow-y-auto">
                        {leads.filter(lead => lead.esarmado === 'SI' || lead.empresa?.includes('armado')).map(lead => (
                          <div key={lead.id} className="p-4 hover:bg-slate-50 transition-colors">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium text-slate-800">{lead.nombre || 'Sin nombre'}</h4>
                                <div className="text-sm text-slate-500 mt-1">
                                  {lead.email && `${lead.email} · `}
                                  {lead.telefono && `${lead.telefono}`}
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200">
                                    Custodio Armado
                                  </Badge>
                                  {lead.credencialsedena === 'SI' && (
                                    <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200">
                                      SEDENA
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="h-8 gap-1 border-green-200 text-green-700 hover:bg-green-50"
                                  onClick={() => {
                                    updateLeadStatus(lead.id, 'Aprobado');
                                    navigate('/lead-journey/validation');
                                  }}
                                >
                                  <Check className="h-3.5 w-3.5" />
                                  <span>Aprobar</span>
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="h-8 gap-1 border-red-200 text-red-700 hover:bg-red-50"
                                  onClick={() => handleOpenClassifyDialog(lead.id)}
                                >
                                  <X className="h-3.5 w-3.5" />
                                  <span>Reclasificar</span>
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="vehicle" className="animate-fade-in">
              <div className="space-y-4">
                <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                  <h3 className="text-green-800 font-medium">Criterios de Clasificación - Custodio con Vehículo</h3>
                  <ul className="mt-2 space-y-1">
                    <li className="text-sm text-slate-700 flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      Verificación de propiedad del vehículo
                    </li>
                    <li className="text-sm text-slate-700 flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      Experiencia mínima de conducción
                    </li>
                    <li className="text-sm text-slate-700 flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      Conocimiento de rutas y zonas locales
                    </li>
                    <li className="text-sm text-slate-700 flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      Documentación del vehículo en regla
                    </li>
                  </ul>
                </div>
                
                {/* Filtered list for vehicle candidates */}
                {loading ? (
                  <div className="flex justify-center items-center p-8">
                    <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                  </div>
                ) : (
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-slate-50 p-3 border-b">
                      <h3 className="font-medium text-slate-700">Candidatos para Custodio con Vehículo</h3>
                    </div>
                    
                    {leads.filter(lead => lead.tienevehiculo === 'SI' || lead.empresa?.includes('vehículo')).length === 0 ? (
                      <div className="p-8 text-center">
                        <p className="text-slate-500">No hay candidatos para Custodio con Vehículo.</p>
                      </div>
                    ) : (
                      <div className="divide-y max-h-[500px] overflow-y-auto">
                        {leads.filter(lead => lead.tienevehiculo === 'SI' || lead.empresa?.includes('vehículo')).map(lead => (
                          <div key={lead.id} className="p-4 hover:bg-slate-50 transition-colors">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium text-slate-800">{lead.nombre || 'Sin nombre'}</h4>
                                <div className="text-sm text-slate-500 mt-1">
                                  {lead.email && `${lead.email} · `}
                                  {lead.telefono && `${lead.telefono}`}
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200">
                                    Custodio con Vehículo
                                  </Badge>
                                  {lead.modelovehiculo && (
                                    <Badge variant="outline" className="text-slate-700">
                                      {lead.modelovehiculo} {lead.anovehiculo || ''}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="h-8 gap-1 border-green-200 text-green-700 hover:bg-green-50"
                                  onClick={() => {
                                    updateLeadStatus(lead.id, 'Aprobado');
                                    navigate('/lead-journey/validation');
                                  }}
                                >
                                  <Check className="h-3.5 w-3.5" />
                                  <span>Aprobar</span>
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="h-8 gap-1 border-red-200 text-red-700 hover:bg-red-50"
                                  onClick={() => handleOpenClassifyDialog(lead.id)}
                                >
                                  <X className="h-3.5 w-3.5" />
                                  <span>Reclasificar</span>
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Classification Dialog */}
      <Dialog open={classifyDialogOpen} onOpenChange={setClassifyDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Clasificar Candidato</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-slate-600 mb-4">
              Por favor seleccione el tipo de custodio para este candidato:
            </p>
            {selectedLead && (
              <div className="mb-4 p-3 bg-slate-50 rounded-lg">
                <h4 className="font-medium">{selectedLead.nombre}</h4>
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
          </div>
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
            <div className="flex justify-end gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setCreateLeadOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">Guardar Candidato</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
