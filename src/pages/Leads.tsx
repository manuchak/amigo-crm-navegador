
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, PhoneCall } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import CallCenter from '../components/call-center';
import { LeadFormDialog } from '@/components/lead-form';
import { useToast } from '@/hooks/use-toast';

const defaultLeads = [
  { id: 1, nombre: 'Carlos Rodríguez', empresa: 'Tecno Solutions', contacto: 'carlos@tecnosolutions.com', estado: 'Nuevo', fechaCreacion: '2023-10-15' },
  { id: 2, nombre: 'María García', empresa: 'Innovación Digital', contacto: 'maria@innovaciondigital.com', estado: 'En progreso', fechaCreacion: '2023-10-10' },
  { id: 3, nombre: 'Juan López', empresa: 'Sistemas Avanzados', contacto: 'juan@sistemasavanzados.com', estado: 'Contactado', fechaCreacion: '2023-10-05' },
  { id: 4, nombre: 'Ana Martínez', empresa: 'Data Insights', contacto: 'ana@datainsights.com', estado: 'Calificado', fechaCreacion: '2023-09-28' },
  { id: 5, nombre: 'Roberto Sánchez', empresa: 'Cloud Services', contacto: 'roberto@cloudservices.com', estado: 'Nuevo', fechaCreacion: '2023-09-20' },
];

const Leads = () => {
  const [leads, setLeads] = useState(defaultLeads);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("leads");
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  
  const estadosLead = ['Todos', 'Nuevo', 'Contactado', 'En progreso', 'Calificado', 'No calificado'];

  const handleUpdateLeadStatus = (leadId: number, newStatus: string) => {
    setLeads(leads.map(lead => 
      lead.id === leadId ? { ...lead, estado: newStatus } : lead
    ));
  };

  const handleSubmitLeadForm = (formData: any) => {
    const newLead = {
      id: leads.length + 1,
      nombre: formData.nombre,
      empresa: "Custodios Armados",
      contacto: `${formData.email} | ${formData.telefono}`,
      estado: 'Nuevo',
      fechaCreacion: new Date().toISOString().split('T')[0],
    };

    setLeads([newLead, ...leads]);

    toast({
      title: "Lead registrado",
      description: `${formData.nombre} ha sido agregado a la lista de llamadas pendientes`,
    });
  };

  return (
    <div className="container mx-auto px-6 py-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Leads</h1>
          <p className="text-muted-foreground mt-1">Administra y da seguimiento a tus prospectos</p>
        </div>
        
        <div className="flex gap-3 mt-4 md:mt-0">
          <Button className="mt-4 md:mt-0" onClick={() => setActiveTab("callcenter")} variant={activeTab === "callcenter" ? "default" : "outline"}>
            <PhoneCall className="mr-2 h-4 w-4" />
            Call Center
          </Button>
          <Button className="mt-4 md:mt-0" onClick={() => setDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Nuevo Lead
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="callcenter">Control de Llamadas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="leads">
          <Tabs defaultValue="Todos" className="w-full">
            <TabsList className="mb-6">
              {estadosLead.map(estado => (
                <TabsTrigger key={estado} value={estado}>{estado}</TabsTrigger>
              ))}
            </TabsList>
            
            {estadosLead.map(estado => (
              <TabsContent key={estado} value={estado}>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Leads {estado !== 'Todos' ? `- ${estado}` : ''}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-3">
                        {Array(5).fill(null).map((_, i) => (
                          <Skeleton key={i} className="h-12 w-full" />
                        ))}
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Empresa</TableHead>
                            <TableHead>Contacto</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Fecha</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {leads
                            .filter(lead => estado === 'Todos' || lead.estado === estado)
                            .map(lead => (
                              <TableRow key={lead.id}>
                                <TableCell className="font-medium">{lead.nombre}</TableCell>
                                <TableCell>{lead.empresa}</TableCell>
                                <TableCell>{lead.contacto}</TableCell>
                                <TableCell>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    lead.estado === 'Nuevo' ? 'bg-blue-100 text-blue-700' :
                                    lead.estado === 'Contactado' ? 'bg-yellow-100 text-yellow-700' :
                                    lead.estado === 'En progreso' ? 'bg-purple-100 text-purple-700' :
                                    lead.estado === 'Calificado' ? 'bg-green-100 text-green-700' :
                                    'bg-red-100 text-red-700'
                                  }`}>
                                    {lead.estado}
                                  </span>
                                </TableCell>
                                <TableCell>{lead.fechaCreacion}</TableCell>
                                <TableCell className="text-right">
                                  <Button variant="ghost" size="sm">
                                    Ver
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </TabsContent>
        
        <TabsContent value="callcenter">
          <CallCenter leads={leads} onUpdateLeadStatus={handleUpdateLeadStatus} />
        </TabsContent>
      </Tabs>

      <LeadFormDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
        onSubmit={handleSubmitLeadForm} 
      />
    </div>
  );
};

export default Leads;
