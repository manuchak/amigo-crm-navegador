
import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Download, ExternalLink } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { VapiCallLog } from './types';
import { DirectionBadge, EvaluationBadge, StatusBadge } from './StatusBadges';
import { formatCost, formatDate, formatDuration } from './utils';

interface CallLogDetailProps {
  selectedLog: VapiCallLog | null;
  dialogOpen: boolean;
  activeTab: string;
  setDialogOpen: (open: boolean) => void;
  setActiveTab: (tab: string) => void;
}

const CallLogDetail: React.FC<CallLogDetailProps> = ({
  selectedLog,
  dialogOpen,
  activeTab,
  setDialogOpen,
  setActiveTab,
}) => {
  if (!selectedLog) return null;

  const handleDownloadRecording = (url: string) => {
    if (!url) return;
    
    window.open(url, '_blank');
    toast.success('Descarga de grabación iniciada');
  };

  return (
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
                      <DirectionBadge direction={selectedLog.direction} />
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
                      <StatusBadge status={selectedLog.status} />
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
                      <EvaluationBadge evaluation={selectedLog.success_evaluation} />
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
  );
};

export default CallLogDetail;
