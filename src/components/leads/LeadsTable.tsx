import React from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useLeads } from '@/context/LeadsContext';
import { executeWebhook } from '@/components/call-center/utils/webhook';
import { toast } from 'sonner';
import { Phone } from 'lucide-react';
import { incrementCallCount } from '@/services/leadService';

interface LeadsTableProps {
  isLoading: boolean;
  onCallLead: (leadId: number) => void;
}

const LeadsTable: React.FC<LeadsTableProps> = ({ isLoading, onCallLead }) => {
  // Add debug logging
  React.useEffect(() => {
    console.log("LeadsTable component mounted");
  }, []);

  const { leads, updateLeadStatus, refetchLeads } = useLeads();
  const estadosLead = ['Todos', 'Nuevo', 'Contactado', 'En progreso', 'Calificado', 'No calificado'];

  const handleCallButton = async (leadId: number) => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) {
      toast.error("Lead no encontrado");
      return;
    }

    // Update lead status to "Contacto Llamado"
    try {
      await updateLeadStatus(leadId, "Contacto Llamado");
      
      // Increment call count
      await incrementCallCount(leadId);
      
      // Parse contact information from the lead to get only the phone number
      let phoneNumber = lead.telefono || '';
      if (!phoneNumber && lead.contacto && lead.contacto.includes('|')) {
        const contactParts = lead.contacto.split('|');
        phoneNumber = contactParts[1].trim();
      }

      // Send all lead data to the webhook
      await executeWebhook({
        telefono: phoneNumber,
        id: lead.id,
        nombre: lead.nombre,
        empresa: lead.empresa,
        contacto: lead.contacto,
        estado: "Contacto Llamado", // Use the new status
        fechaCreacion: lead.fechaCreacion,
        email: lead.email,
        tieneVehiculo: lead.tieneVehiculo,
        experienciaSeguridad: lead.experienciaSeguridad,
        esMilitar: lead.esMilitar,
        callCount: (lead.callCount || 0) + 1, // Increment call count
        lastCallDate: new Date().toISOString(),
        valor: lead.valor,
        timestamp: new Date().toISOString(),
        action: "outbound_call_requested_from_list"
      });
      
      toast.success(`Llamada solicitada para ${lead.nombre}`);
      
      // Refresh leads to update UI with new status and call count
      await refetchLeads();
    } catch (error) {
      console.error("Error updating lead or executing webhook:", error);
      toast.error("Error al solicitar la llamada");
    }

    // Navigate to call center tab
    onCallLead(leadId);
  };

  return (
    <Tabs defaultValue="Todos" className="w-full">
      <TabsList className="mb-6 bg-white rounded-lg p-1 border border-slate-100">
        {estadosLead.map(estado => (
          <TabsTrigger key={estado} value={estado} className="rounded-md text-sm">
            {estado}
          </TabsTrigger>
        ))}
      </TabsList>
      
      {estadosLead.map(estado => (
        <TabsContent key={estado} value={estado}>
          <Card className="shadow-sm border-slate-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Leads {estado !== 'Todos' ? `- ${estado}` : ''}</CardTitle>
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
                    <TableRow className="bg-slate-50">
                      <TableHead className="text-xs font-medium text-slate-500">Nombre</TableHead>
                      <TableHead className="text-xs font-medium text-slate-500">Empresa</TableHead>
                      <TableHead className="text-xs font-medium text-slate-500">Contacto</TableHead>
                      <TableHead className="text-xs font-medium text-slate-500">Estado</TableHead>
                      <TableHead className="text-xs font-medium text-slate-500">Fecha</TableHead>
                      <TableHead className="text-right text-xs font-medium text-slate-500">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leads
                      .filter(lead => estado === 'Todos' || lead.estado === estado)
                      .map(lead => (
                        <TableRow key={lead.id} className="hover:bg-slate-50">
                          <TableCell className="font-medium">{lead.nombre}</TableCell>
                          <TableCell className="text-sm text-slate-600">{lead.empresa}</TableCell>
                          <TableCell className="text-sm text-slate-600">{lead.contacto}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              lead.estado === 'Nuevo' ? 'bg-blue-50 text-blue-600' :
                              lead.estado === 'Contactado' ? 'bg-amber-50 text-amber-600' :
                              lead.estado === 'En progreso' ? 'bg-purple-50 text-purple-600' :
                              lead.estado === 'Calificado' ? 'bg-green-50 text-green-600' :
                              'bg-red-50 text-red-600'
                            }`}>
                              {lead.estado}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm text-slate-600">{lead.fechaCreacion}</TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleCallButton(lead.id)}
                              className="text-slate-700 hover:text-primary"
                            >
                              <Phone className="h-4 w-4 mr-1" />
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
