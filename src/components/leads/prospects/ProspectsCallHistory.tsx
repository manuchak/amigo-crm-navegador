
import React, { useState } from 'react';
import { Prospect } from '@/services/prospectService';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatPhoneNumber } from '@/lib/utils';
import { Loader2, FileText, Play, Volume2, ChevronDown, ChevronUp } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLeadCallLogs } from '@/hooks/lead-call-logs';
import { VapiCallLog } from '@/components/leads/types';
import { Json } from '@/integrations/supabase/types';

interface ProspectsCallHistoryProps {
  prospect: Prospect;
  onBack: () => void;
}

interface TranscriptItem {
  speaker: string;
  text: string;
  timestamp: string;
}

const ProspectsCallHistory: React.FC<ProspectsCallHistoryProps> = ({ prospect, onBack }) => {
  const [selectedCallId, setSelectedCallId] = useState<string | null>(null);
  const [transcriptOpen, setTranscriptOpen] = useState(false);
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  
  const { callLogs, loading } = useLeadCallLogs(
    prospect.lead_id || null,
    prospect.lead_phone || prospect.phone_number_intl || null
  );

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: string | null) => {
    if (!status) return 'bg-slate-100 text-slate-600';
    
    switch (status.toLowerCase()) {
      case 'completed':
      case 'success':
        return 'bg-green-50 text-green-600';
      case 'failed':
      case 'error':
        return 'bg-red-50 text-red-600';
      case 'busy':
      case 'no-answer':
        return 'bg-amber-50 text-amber-600';
      case 'in-progress':
      case 'calling':
        return 'bg-blue-50 text-blue-600';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  };

  const handleViewTranscript = (callId: string) => {
    setSelectedCallId(callId);
    setTranscriptOpen(true);
  };
  
  const handleToggleExpand = (callId: string) => {
    if (expandedRows.includes(callId)) {
      setExpandedRows(expandedRows.filter(id => id !== callId));
    } else {
      setExpandedRows([...expandedRows, callId]);
    }
  };
  
  const selectedCall = callLogs.find(log => log.id === selectedCallId);
  
  // Check if transcript data is valid and parse it to the expected format
  const hasValidTranscript = (data: Json | null): boolean => {
    if (!data) return false;
    if (typeof data === 'object' && data !== null && 'transcript' in data) {
      return Array.isArray((data as any).transcript);
    }
    return false;
  };

  // Type guard to check if a value is a transcript object
  const isTranscriptArray = (data: any): data is TranscriptItem[] => {
    return Array.isArray(data) && data.length > 0 && 'speaker' in data[0] && 'text' in data[0];
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-lg font-medium">
            Historial de Llamadas - {prospect.lead_name || prospect.custodio_name || "Prospecto"}
          </h2>
          <p className="text-sm text-slate-500">
            {formatPhoneNumber(prospect.lead_phone || prospect.phone_number_intl || "")}
            {prospect.call_count !== null && (
              <Badge variant="outline" className="ml-2 bg-blue-50">
                {prospect.call_count} llamadas
              </Badge>
            )}
          </p>
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Registro de comunicaciones</CardTitle>
          <CardDescription>
            Historial completo de intentos de contacto
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : callLogs.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <p>No se encontraron registros de llamadas para este prospecto</p>
            </div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha/Hora</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Duración</TableHead>
                    <TableHead>Grabación</TableHead>
                    <TableHead>Transcripción</TableHead>
                    <TableHead className="w-8"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {callLogs.map((call) => {
                    const isExpanded = expandedRows.includes(call.id);
                    const status = call.status || null;
                    const hasTranscript = call.transcript !== null;
                    return (
                      <React.Fragment key={call.id}>
                        <TableRow className="hover:bg-slate-50">
                          <TableCell>{formatDate(call.start_time)}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(status)}>
                              {status || 'Desconocido'}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDuration(call.duration)}</TableCell>
                          <TableCell>
                            {call.recording_url ? (
                              <Button variant="ghost" size="sm" className="h-7 px-2" asChild>
                                <a href={call.recording_url} target="_blank" rel="noopener noreferrer">
                                  <Volume2 className="h-4 w-4 mr-1" /> Audio
                                </a>
                              </Button>
                            ) : (
                              <span className="text-slate-400 text-sm">No disponible</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {hasTranscript ? (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="h-7 px-2" 
                                onClick={() => handleViewTranscript(call.id)}
                              >
                                <FileText className="h-4 w-4 mr-1" /> Ver
                              </Button>
                            ) : (
                              <span className="text-slate-400 text-sm">No disponible</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="p-0 h-8 w-8" 
                              onClick={() => handleToggleExpand(call.id)}
                            >
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                        
                        {isExpanded && (
                          <TableRow>
                            <TableCell colSpan={6} className="p-0">
                              <div className="p-4 bg-slate-50">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                  <div>
                                    <p className="font-medium mb-1">Detalles de la llamada</p>
                                    <p className="text-slate-600">ID: {call.id}</p>
                                    <p className="text-slate-600">Tipo: {call.call_type || 'No especificado'}</p>
                                    <p className="text-slate-600">Estado: {call.status || 'No especificado'}</p>
                                  </div>
                                  
                                  <div>
                                    <p className="font-medium mb-1">Información del contacto</p>
                                    <p className="text-slate-600">Teléfono: {formatPhoneNumber(call.customer_number || call.caller_phone_number || 'No disponible')}</p>
                                    <p className="text-slate-600">Duración: {formatDuration(call.duration)} segundos</p>
                                  </div>
                                  
                                  {hasTranscript && (
                                    <div>
                                      <p className="font-medium mb-1">Transcripción</p>
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => handleViewTranscript(call.id)}
                                      >
                                        <FileText className="h-4 w-4 mr-2" /> Ver transcripción completa
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Transcript Dialog */}
      <Dialog open={transcriptOpen} onOpenChange={setTranscriptOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Transcripción de Llamada</DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="max-h-[60vh]">
            {selectedCall?.transcript && (
              <div className="space-y-4 p-4">
                {hasValidTranscript(selectedCall.transcript) && 
                 isTranscriptArray((selectedCall.transcript as any).transcript) ? (
                  ((selectedCall.transcript as any).transcript as TranscriptItem[]).map((item, index) => {
                    const isAssistant = item.speaker.toLowerCase().includes('assistant');
                    
                    return (
                      <div 
                        key={index} 
                        className={`flex ${isAssistant ? 'justify-start' : 'justify-end'}`}
                      >
                        <div 
                          className={`flex max-w-[80%] rounded-lg p-3 ${
                            isAssistant 
                              ? 'bg-slate-100 text-slate-800' 
                              : 'bg-blue-50 text-blue-800'
                          }`}
                        >
                          <div className="mr-2 mt-1">
                            {isAssistant ? (
                              <div className="h-6 w-6 rounded-full bg-slate-300 flex items-center justify-center">A</div>
                            ) : (
                              <div className="h-6 w-6 rounded-full bg-blue-300 flex items-center justify-center">C</div>
                            )}
                          </div>
                          <div>
                            <div className="text-xs font-medium mb-1">
                              {isAssistant ? 'Asistente' : 'Custodio'}
                              <span className="text-xs opacity-70 ml-2">
                                {new Date(item.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                            <div className="text-sm">{item.text}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-4">
                    <p>Formato de transcripción no reconocido.</p>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
          
          <CardFooter>
            <Button variant="outline" onClick={() => setTranscriptOpen(false)}>
              Cerrar
            </Button>
          </CardFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProspectsCallHistory;
