
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Phone, Clock, Play, Volume2, FileText, RefreshCw } from 'lucide-react';
import { Badge } from '../ui/badge';
import { VapiCallLog } from './types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

interface CallLogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leadName: string;
  leadPhone: string | null;
  callLogs: VapiCallLog[];
  loading: boolean;
}

const CallLogDialog: React.FC<CallLogDialogProps> = ({
  open,
  onOpenChange,
  leadName,
  leadPhone,
  callLogs,
  loading
}) => {
  const formatDateTime = (dateTimeString: string | null) => {
    if (!dateTimeString) return 'N/A';
    const date = new Date(dateTimeString);
    return date.toLocaleString('es-MX', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };
  
  const formatDuration = (seconds: number | null) => {
    if (!seconds) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  const formatPhoneNumber = (phone: string | null) => {
    if (!phone) return 'Sin número';
    
    // Remove non-digit characters
    const digits = phone.replace(/\D/g, '');
    
    // Format for display if it's a valid number
    if (digits.length >= 10) {
      // Format as international number if it has country code
      if (digits.length > 10) {
        const countryCode = digits.slice(0, digits.length - 10);
        const areaCode = digits.slice(digits.length - 10, digits.length - 7);
        const firstPart = digits.slice(digits.length - 7, digits.length - 4);
        const secondPart = digits.slice(digits.length - 4);
        return `+${countryCode} (${areaCode}) ${firstPart}-${secondPart}`;
      } else {
        // Format as local number
        const areaCode = digits.slice(0, 3);
        const firstPart = digits.slice(3, 6);
        const secondPart = digits.slice(6);
        return `(${areaCode}) ${firstPart}-${secondPart}`;
      }
    }
    
    // Return the original if we can't format it
    return phone;
  };
  
  const getStatusBadge = (status: string | null) => {
    if (!status) return <Badge variant="outline">Desconocido</Badge>;
    
    switch (status.toLowerCase()) {
      case 'completed':
        return <Badge className="bg-green-500 font-normal">Completada</Badge>;
      case 'failed':
        return <Badge variant="destructive" className="font-normal">Fallida</Badge>;
      case 'busy':
        return <Badge variant="outline" className="border-amber-500 text-amber-700 font-normal">Ocupado</Badge>;
      case 'no-answer':
        return <Badge variant="outline" className="border-blue-500 text-blue-700 font-normal">Sin respuesta</Badge>;
      default:
        return <Badge variant="secondary" className="font-normal">{status}</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden border-0 shadow-lg rounded-xl">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="flex items-center gap-2 text-lg font-medium">
            <Phone className="h-4 w-4 text-primary" />
            Historial de llamadas: {leadName}
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500">
            {leadPhone ? `Teléfono: ${formatPhoneNumber(leadPhone)}` : 'Sin número de teléfono registrado'}
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="calls" className="px-6">
          <TabsList className="mb-4">
            <TabsTrigger value="calls">Llamadas</TabsTrigger>
            <TabsTrigger value="stats">Estadísticas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="calls">
            <ScrollArea className="h-[400px]">
              {loading ? (
                <div className="space-y-2 p-4">
                  {Array(3).fill(null).map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : callLogs.length === 0 ? (
                <div className="text-center py-8 text-slate-400 flex flex-col items-center">
                  <Phone className="h-8 w-8 mb-2 opacity-30" />
                  <p>No hay registros de llamadas para este custodio</p>
                  <p className="text-xs mt-2 max-w-md text-center">
                    Si ya se han realizado llamadas, es posible que los números no coincidan 
                    exactamente en los registros. Intente sincronizar los registros de VAPI.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Fecha/Hora</TableHead>
                      <TableHead className="text-xs">Estado</TableHead>
                      <TableHead className="text-xs">Dirección</TableHead>
                      <TableHead className="text-xs">Duración</TableHead>
                      <TableHead className="text-xs">Audio</TableHead>
                      <TableHead className="text-xs">Transcripción</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {callLogs.map((log) => (
                      <TableRow key={log.id} className="text-sm">
                        <TableCell className="py-3">
                          {formatDateTime(log.start_time)}
                        </TableCell>
                        <TableCell className="py-3">
                          {getStatusBadge(log.status)}
                        </TableCell>
                        <TableCell className="py-3">
                          {log.direction === 'inbound' ? 'Entrante' : 
                           log.direction === 'outbound' ? 'Saliente' : 'N/A'}
                        </TableCell>
                        <TableCell className="py-3 flex items-center gap-1">
                          <Clock className="h-3 w-3 text-slate-400" /> {formatDuration(log.duration)}
                        </TableCell>
                        <TableCell className="py-3">
                          {log.recording_url ? (
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0" 
                              onClick={() => window.open(log.recording_url as string, '_blank')}>
                              <Play className="h-3 w-3" />
                            </Button>
                          ) : (
                            <span className="text-slate-400 text-xs">No disponible</span>
                          )}
                        </TableCell>
                        <TableCell className="py-3">
                          {log.transcript ? (
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                              <FileText className="h-3 w-3" />
                            </Button>
                          ) : (
                            <span className="text-slate-400 text-xs">No disponible</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="stats">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
              <div className="border rounded-lg p-4 text-center">
                <h3 className="text-sm text-slate-500 mb-2">Total de llamadas</h3>
                <p className="text-2xl font-semibold">{callLogs.length}</p>
              </div>
              <div className="border rounded-lg p-4 text-center">
                <h3 className="text-sm text-slate-500 mb-2">Llamadas completadas</h3>
                <p className="text-2xl font-semibold">{callLogs.filter(log => log.status?.toLowerCase() === 'completed').length}</p>
              </div>
              <div className="border rounded-lg p-4 text-center">
                <h3 className="text-sm text-slate-500 mb-2">Tiempo total</h3>
                <p className="text-2xl font-semibold">
                  {formatDuration(
                    callLogs.reduce((total, log) => total + (log.duration || 0), 0)
                  )}
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="p-4 bg-slate-50 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-full px-4 py-1 h-8 text-sm">
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CallLogDialog;
