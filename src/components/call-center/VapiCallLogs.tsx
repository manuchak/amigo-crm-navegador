
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, Phone, PhoneForwarded, Info, Calendar, Download, ExternalLink, Check, XCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format, parseISO, subDays, startOfDay, endOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import VapiCallFilters, { CallFilters } from './VapiCallFilters';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface VapiCallLog {
  id: string;
  log_id: string;
  assistant_id: string;
  assistant_name: string | null;
  organization_id: string;
  conversation_id: string | null;
  phone_number: string | null;
  caller_phone_number: string | null;
  customer_number: string | null;
  assistant_phone_number: string | null;
  call_type: string | null;
  start_time: string | null;
  end_time: string | null;
  duration: number | null;
  status: string | null;
  direction: string | null;
  transcript: any | null;
  recording_url: string | null;
  metadata: any | null;
  created_at: string | null;
  updated_at: string | null;
  ended_reason: string | null;
  cost: number | null;
  success_evaluation: string | null;
}

interface VapiCallLogsProps {
  limit?: number;
  onRefresh?: () => void;
}

const VapiCallLogs: React.FC<VapiCallLogsProps> = ({ limit = 10, onRefresh }) => {
  const [callLogs, setCallLogs] = useState<VapiCallLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<VapiCallLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [selectedLog, setSelectedLog] = useState<VapiCallLog | null>(null);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('details');
  const [syncStats, setSyncStats] = useState<{
    total: number;
    inserted: number;
    updated: number;
    errors: number;
  } | null>(null);
  const [filters, setFilters] = useState<CallFilters>({
    status: null,
    direction: null,
    duration: null,
    dateRange: null
  });
  const [columnView, setColumnView] = useState<'standard' | 'extended'>('standard');

  const fetchCallLogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('vapi_call_logs')
        .select('*')
        .order('start_time', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      if (data) {
        console.log('Fetched logs:', data.slice(0, 2));
        const logs = data as unknown as VapiCallLog[];
        setCallLogs(logs);
        applyFilters(logs, filters);
      } else {
        setCallLogs([]);
        setFilteredLogs([]);
      }
    } catch (error) {
      console.error('Error fetching VAPI call logs:', error);
      toast.error('Error al cargar registros de llamadas');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (logs: VapiCallLog[], activeFilters: CallFilters) => {
    let filtered = [...logs];
    
    if (activeFilters.status) {
      filtered = filtered.filter(log => 
        log.status?.toLowerCase() === activeFilters.status
      );
    }
    
    if (activeFilters.direction) {
      filtered = filtered.filter(log => 
        log.direction?.toLowerCase() === activeFilters.direction
      );
    }
    
    if (activeFilters.duration) {
      const durationSeconds = activeFilters.duration;
      filtered = filtered.filter(log => {
        if (durationSeconds === 30) {
          return (log.duration || 0) < 30;
        } else if (durationSeconds === 60) {
          return (log.duration || 0) > 60;
        } else if (durationSeconds === 300) {
          return (log.duration || 0) > 300;
        }
        return true;
      });
    }
    
    if (activeFilters.dateRange) {
      const now = new Date();
      let startDate: Date;
      
      if (activeFilters.dateRange === 'today') {
        startDate = startOfDay(now);
      } else if (activeFilters.dateRange === 'week') {
        startDate = subDays(now, 7);
      } else if (activeFilters.dateRange === 'month') {
        startDate = subDays(now, 30);
      } else {
        startDate = new Date(0);
      }
      
      filtered = filtered.filter(log => {
        if (!log.start_time) return false;
        const logDate = new Date(log.start_time);
        return logDate >= startDate;
      });
    }
    
    setFilteredLogs(filtered);
  };

  const handleFilterChange = (newFilters: CallFilters) => {
    setFilters(newFilters);
    applyFilters(callLogs, newFilters);
  };

  const syncCallLogs = async () => {
    setSyncing(true);
    setSyncStats(null);
    try {
      const response = await supabase.functions.invoke('fetch-vapi-logs', {
        method: 'POST',
        body: {},
      });

      if (response.error) {
        throw new Error(response.error.message || 'Error calling VAPI fetch function');
      }

      if (response.data && response.data.success === false) {
        throw new Error(response.data.message || 'Error syncing call logs');
      }

      if (response.data) {
        setSyncStats({
          total: response.data.total_logs || 0,
          inserted: response.data.inserted || 0,
          updated: response.data.updated || 0,
          errors: response.data.errors || 0
        });
      }

      const message = response.data?.message || 'Registros sincronizados con éxito';
      toast.success(message);
      
      fetchCallLogs();
      
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error('Error syncing VAPI call logs:', error);
      toast.error(`Error al sincronizar: ${error.message || 'Error desconocido'}`);
    } finally {
      setSyncing(false);
    }
  };

  const handleViewDetails = (log: VapiCallLog) => {
    setSelectedLog(log);
    setDialogOpen(true);
  };

  const handleDownloadRecording = (url: string) => {
    if (!url) return;
    
    window.open(url, '_blank');
    toast.success('Descarga de grabación iniciada');
  };

  const formatDuration = (seconds: number | null) => {
    if (seconds === null || seconds === undefined) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
      return format(parseISO(dateString), 'dd/MM/yyyy HH:mm', { locale: es });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  const formatCost = (cost: number | null) => {
    if (cost === null || cost === undefined) return 'N/A';
    return `$${cost.toFixed(3)} USD`;
  };

  const getStatusBadge = (status: string | null) => {
    if (!status) return <Badge variant="secondary">Desconocido</Badge>;
    
    switch (status.toLowerCase()) {
      case 'completed':
        return <Badge variant="success" className="bg-green-500">Completada</Badge>;
      case 'failed':
        return <Badge variant="destructive">Fallida</Badge>;
      case 'ongoing':
        return <Badge variant="warning" className="bg-yellow-500 hover:bg-yellow-600">En curso</Badge>;
      case 'queued':
        return <Badge variant="outline" className="border-blue-500 text-blue-700">En cola</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getDirectionBadge = (direction: string | null) => {
    if (!direction) return <Badge variant="secondary">Desconocido</Badge>;
    
    switch (direction.toLowerCase()) {
      case 'inbound':
        return <Badge className="bg-blue-500 flex items-center"><Phone className="mr-1 h-3 w-3" /> Entrante</Badge>;
      case 'outbound':
        return <Badge className="bg-purple-500 flex items-center"><PhoneForwarded className="mr-1 h-3 w-3" /> Saliente</Badge>;
      default:
        return <Badge variant="secondary">{direction}</Badge>;
    }
  };

  const getSuccessEvaluationBadge = (evaluation: string | null) => {
    if (!evaluation) return null;
    
    switch (evaluation.toLowerCase()) {
      case 'success':
      case 'successful':
        return <Badge variant="success" className="bg-green-500 flex items-center"><Check className="mr-1 h-3 w-3" /> Exitosa</Badge>;
      case 'failed':
      case 'failure':
        return <Badge variant="destructive" className="flex items-center"><XCircle className="mr-1 h-3 w-3" /> Fallida</Badge>;
      default:
        return <Badge variant="secondary">{evaluation}</Badge>;
    }
  };

  useEffect(() => {
    fetchCallLogs();
  }, [limit]);
  
  useEffect(() => {
    applyFilters(callLogs, filters);
  }, [callLogs, filters]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-xl">Registros de Llamadas VAPI</CardTitle>
            <CardDescription>
              Historial de las últimas {limit} llamadas procesadas por VAPI AI
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setColumnView(columnView === 'standard' ? 'extended' : 'standard')}
            >
              {columnView === 'standard' ? 'Ver detalles extendidos' : 'Vista estándar'}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchCallLogs}
              disabled={loading || syncing}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
            <Button 
              size="sm" 
              onClick={syncCallLogs}
              disabled={syncing}
            >
              <Loader2 className={`h-4 w-4 mr-1 ${syncing ? 'animate-spin' : ''}`} />
              Sincronizar con API
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {syncStats && (
            <Alert className="mb-4 bg-primary/10">
              <AlertDescription className="text-sm text-primary-foreground">
                <div className="flex justify-between items-center">
                  <span>Última sincronización:</span>
                  <div className="flex space-x-4">
                    <div className="flex items-center">
                      <Badge variant="outline" className="mr-2">Total: {syncStats.total}</Badge>
                      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                        Nuevos: {syncStats.inserted}
                      </Badge>
                    </div>
                    <div className="flex items-center">
                      <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200 mr-2">
                        Actualizados: {syncStats.updated}
                      </Badge>
                      {syncStats.errors > 0 && (
                        <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
                          Errores: {syncStats.errors}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="mb-4">
            <VapiCallFilters onFilterChange={handleFilterChange} activeFilters={filters} />
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2">Cargando registros de llamadas...</span>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <Phone className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p>No hay registros de llamadas disponibles</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-4" 
                onClick={syncCallLogs}
                disabled={syncing}
              >
                Sincronizar desde VAPI
              </Button>
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    {columnView === 'extended' ? (
                      <>
                        <TableHead>Call ID</TableHead>
                        <TableHead>Asistente</TableHead>
                        <TableHead>Teléfono Asistente</TableHead>
                        <TableHead>Teléfono Cliente</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Duración</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Razón Finalización</TableHead>
                        <TableHead>Costo</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Evaluación</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </>
                    ) : (
                      <>
                        <TableHead>Fecha/Hora</TableHead>
                        <TableHead>Teléfono</TableHead>
                        <TableHead>Dirección</TableHead>
                        <TableHead>Duración</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id} className="hover:bg-gray-50">
                      {columnView === 'extended' ? (
                        <>
                          <TableCell className="font-mono text-xs">
                            {log.log_id?.substring(0, 8) || 'N/A'}...
                          </TableCell>
                          <TableCell>
                            {log.assistant_name || 'VAPI Asistente'}
                          </TableCell>
                          <TableCell>
                            {log.assistant_phone_number || log.phone_number || 'N/A'}
                          </TableCell>
                          <TableCell>
                            {log.customer_number || log.caller_phone_number || 'N/A'}
                          </TableCell>
                          <TableCell>
                            {log.call_type || 'N/A'}
                          </TableCell>
                          <TableCell>
                            {log.duration !== null ? formatDuration(log.duration) : 'N/A'}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(log.status)}
                          </TableCell>
                          <TableCell>
                            {log.ended_reason || 'N/A'}
                          </TableCell>
                          <TableCell>
                            {formatCost(log.cost)}
                          </TableCell>
                          <TableCell>
                            {formatDate(log.start_time)}
                          </TableCell>
                          <TableCell>
                            {getSuccessEvaluationBadge(log.success_evaluation)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleViewDetails(log)}
                            >
                              <Info className="h-4 w-4 mr-1" />
                              Detalles
                            </Button>
                          </TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell>
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                              {formatDate(log.start_time)}
                            </div>
                          </TableCell>
                          <TableCell>
                            {log.customer_number || log.caller_phone_number || log.phone_number || 'Desconocido'}
                          </TableCell>
                          <TableCell>
                            {getDirectionBadge(log.direction)}
                          </TableCell>
                          <TableCell>
                            {log.duration !== null ? formatDuration(log.duration) : 'N/A'}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(log.status)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleViewDetails(log)}
                            >
                              <Info className="h-4 w-4 mr-1" />
                              Detalles
                            </Button>
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedLog && (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>Detalles de la llamada</span>
                <Badge variant="outline" className="font-mono text-xs">
                  ID: {selectedLog.log_id?.substring(0, 12)}...
                </Badge>
              </DialogTitle>
              <DialogDescription>
                {formatDate(selectedLog.start_time)}
              </DialogDescription>
            </DialogHeader>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
              <TabsList className="mb-4">
                <TabsTrigger value="details">Información general</TabsTrigger>
                <TabsTrigger value="transcript">Transcripción</TabsTrigger>
                <TabsTrigger value="metadata">Metadata</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="flex-1 overflow-hidden">
                <ScrollArea className="h-full pr-4">
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Asistente</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedLog.assistant_name || 'VAPI Asistente'}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">ID de Asistente</p>
                        <p className="text-sm font-mono text-muted-foreground">
                          {selectedLog.assistant_id || 'No disponible'}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Teléfono Asistente</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedLog.assistant_phone_number || selectedLog.phone_number || 'No disponible'}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Teléfono Cliente</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedLog.customer_number || selectedLog.caller_phone_number || 'No disponible'}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Tipo de Llamada</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedLog.call_type || 'No especificado'}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Dirección</p>
                        <div className="text-sm">
                          {getDirectionBadge(selectedLog.direction)}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Hora de inicio</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(selectedLog.start_time)}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Hora de fin</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(selectedLog.end_time)}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Duración</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedLog.duration ? formatDuration(selectedLog.duration) : 'No disponible'}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Estado</p>
                        <div className="text-sm">
                          {getStatusBadge(selectedLog.status)}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Razón de Finalización</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedLog.ended_reason || 'No disponible'}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Costo</p>
                        <p className="text-sm text-muted-foreground">
                          {formatCost(selectedLog.cost)}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Evaluación</p>
                        <div className="text-sm">
                          {getSuccessEvaluationBadge(selectedLog.success_evaluation) || 'No evaluada'}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">ID de Conversación</p>
                        <p className="text-sm font-mono text-muted-foreground">
                          {selectedLog.conversation_id || 'No disponible'}
                        </p>
                      </div>
                    </div>
                    
                    {selectedLog.recording_url && (
                      <div className="mt-4">
                        <p className="text-sm font-medium mb-2">Grabación</p>
                        <div className="flex flex-col space-y-2">
                          <audio controls className="w-full">
                            <source src={selectedLog.recording_url} type="audio/mpeg" />
                            Tu navegador no soporta el elemento de audio.
                          </audio>
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDownloadRecording(selectedLog.recording_url || '')}
                              className="flex items-center"
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Descargar grabación
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => window.open(selectedLog.recording_url || '', '_blank')}
                              className="flex items-center"
                            >
                              <ExternalLink className="h-4 w-4 mr-1" />
                              Abrir en nueva pestaña
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="transcript" className="flex-1 overflow-hidden">
                <ScrollArea className="h-full pr-4">
                  {selectedLog.transcript ? (
                    <div className="space-y-4">
                      {Array.isArray(selectedLog.transcript) ? (
                        selectedLog.transcript.map((part, idx) => (
                          <div key={idx} className={`p-3 rounded-lg ${part.role === 'assistant' ? 'bg-primary/10 ml-6' : 'bg-muted mr-6'}`}>
                            <p className="text-xs font-semibold mb-1">
                              {part.role === 'assistant' ? 'Asistente' : 'Cliente'}:
                            </p>
                            <p className="text-sm">{part.content}</p>
                          </div>
                        ))
                      ) : (
                        <pre className="text-xs whitespace-pre-wrap bg-muted p-4 rounded-md">
                          {JSON.stringify(selectedLog.transcript, null, 2)}
                        </pre>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-10 text-muted-foreground">
                      No hay transcripción disponible para esta llamada
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="metadata" className="flex-1 overflow-hidden">
                <ScrollArea className="h-full pr-4">
                  {selectedLog.metadata ? (
                    <pre className="text-xs whitespace-pre-wrap bg-muted p-4 rounded-md">
                      {JSON.stringify(selectedLog.metadata, null, 2)}
                    </pre>
                  ) : (
                    <div className="text-center py-10 text-muted-foreground">
                      No hay metadatos disponibles para esta llamada
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cerrar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default VapiCallLogs;
