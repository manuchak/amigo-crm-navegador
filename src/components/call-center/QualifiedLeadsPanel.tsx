
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, PhoneCall, Clock, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface QualifiedLead {
  lead_id: number;
  lead_name: string;
  lead_phone: string;
  call_count: number;
  last_call_date: string;
  transcript: any;
}

const QualifiedLeadsPanel: React.FC = () => {
  const [qualifiedLeads, setQualifiedLeads] = useState<QualifiedLead[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQualifiedLeads = async () => {
    setLoading(true);
    try {
      // Call the database function we created to get qualified leads from call transcripts
      const { data, error } = await supabase.rpc('get_qualified_leads_from_calls');
      
      if (error) {
        throw error;
      }
      
      setQualifiedLeads(data || []);
    } catch (error: any) {
      console.error('Error fetching qualified leads:', error);
      toast.error('Error al cargar leads calificados');
    } finally {
      setLoading(false);
    }
  };

  // Trigger automatic refresh of VAPI logs and then fetch qualified leads
  const handleRefreshData = async () => {
    try {
      // First call the edge function to fetch latest logs from VAPI API
      const { data: syncData, error: syncError } = await supabase.functions.invoke('fetch-vapi-logs', {
        method: 'POST',
        body: { full_refresh: true }
      });
      
      if (syncError) {
        throw syncError;
      }
      
      toast.success(syncData?.message || 'Logs sincronizados correctamente');
      
      // Then fetch the qualified leads with fresh data
      await fetchQualifiedLeads();
    } catch (error: any) {
      console.error('Error refreshing data:', error);
      toast.error('Error al sincronizar datos');
    }
  };

  // Initial fetch on component mount
  useEffect(() => {
    fetchQualifiedLeads();
  }, []);

  // Format timestamp
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES') + ' ' + date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  // Extract key phrases from transcript to provide insights
  const getLeadInsights = (transcript: any): string => {
    if (!transcript || !Array.isArray(transcript)) return 'Sin datos';
    
    // Look for customer responses that might indicate interest or qualification
    const customerMessages = transcript.filter(msg => msg.role !== 'assistant');
    if (customerMessages.length === 0) return 'Sin respuestas del cliente';
    
    // Just return a summary of message count for now, in a real app you'd use AI to analyze this
    return `${customerMessages.length} respuestas del cliente`;
  };

  return (
    <Card className="border shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-xl">Leads Calificados por Llamadas</CardTitle>
          <CardDescription>
            Leads identificados a partir de transcripciones de llamadas
          </CardDescription>
        </div>
        <Button 
          onClick={handleRefreshData} 
          size="sm"
          variant="outline"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar Datos
        </Button>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2">Cargando leads calificados...</span>
          </div>
        ) : qualifiedLeads.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            No se encontraron leads calificados en las transcripciones de llamadas
          </div>
        ) : (
          <ScrollArea className="h-[320px]">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Nombre</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Llamadas</TableHead>
                  <TableHead>Última Llamada</TableHead>
                  <TableHead>Insights</TableHead>
                  <TableHead className="text-right">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {qualifiedLeads.map((lead) => (
                  <TableRow key={lead.lead_id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{lead.lead_name}</TableCell>
                    <TableCell>{lead.lead_phone}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {lead.call_count}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(lead.last_call_date)}</TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {getLeadInsights(lead.transcript)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost">
                        <PhoneCall className="h-4 w-4 mr-1" />
                        Llamar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default QualifiedLeadsPanel;
