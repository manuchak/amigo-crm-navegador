
import React from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useLeads } from '@/context/LeadsContext';
import { executeWebhook } from '@/components/call-center/utils/webhook';
import { toast } from 'sonner';

interface LeadsTableProps {
  isLoading: boolean;
  onCallLead: (leadId: number) => void;
}

const LeadsTable: React.FC<LeadsTableProps> = ({ isLoading, onCallLead }) => {
  const { leads } = useLeads();
  const estadosLead = ['Todos', 'Nuevo', 'Contactado', 'En progreso', 'Calificado', 'No calificado'];

  const handleCallButton = async (leadId: number) => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) {
      toast.error("Lead no encontrado");
      return;
    }

    // Send data to webhook before navigating to call center
    try {
      await executeWebhook({
        leadName: lead.nombre,
        leadId: leadId,
        timestamp: new Date().toISOString(),
        action: "outbound_call_requested_from_list"
      });
      
      toast.success(`Llamada saliente solicitada para ${lead.nombre}`);
    } catch (error) {
      console.error("Error executing webhook:", error);
      toast.error("Error al solicitar la llamada saliente");
    }

    // Navigate to call center tab
    onCallLead(leadId);
  };

  return (
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
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleCallButton(lead.id)}
                            >
                              Llamar
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
  );
};

export default LeadsTable;
