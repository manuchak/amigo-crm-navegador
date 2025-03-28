
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
import { Phone, Clock, MessageSquare, FileText } from 'lucide-react';
import { CallRecord } from '../call-center/types';
import { Badge } from '../ui/badge';

interface CallLogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leadName: string;
  callLogs: CallRecord[];
}

const CallLogDialog: React.FC<CallLogDialogProps> = ({
  open,
  onOpenChange,
  leadName,
  callLogs
}) => {
  const getResultBadge = (result: string) => {
    switch (result.toLowerCase()) {
      case 'contactado':
        return <Badge className="bg-green-500">Contactado</Badge>;
      case 'no contestó':
        return <Badge variant="outline" className="border-amber-500 text-amber-700">No contestó</Badge>;
      case 'número equivocado':
        return <Badge variant="destructive">Número equivocado</Badge>;
      case 'buzón':
        return <Badge variant="outline" className="border-blue-500 text-blue-700">Buzón</Badge>;
      default:
        return <Badge variant="secondary">{result}</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Historial de llamadas: {leadName}</DialogTitle>
          <DialogDescription>
            Registro de todas las llamadas realizadas a este custodio
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="mt-4 h-[300px] pr-4">
          {callLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay registros de llamadas para este custodio
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Hora</TableHead>
                  <TableHead>Duración</TableHead>
                  <TableHead>Resultado</TableHead>
                  <TableHead>Notas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {callLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{log.fechaLlamada}</TableCell>
                    <TableCell>{log.horaLlamada}</TableCell>
                    <TableCell className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {log.duracion}
                    </TableCell>
                    <TableCell>{getResultBadge(log.resultado)}</TableCell>
                    <TableCell className="max-w-[150px] truncate">
                      {log.notas ? log.notas : <span className="text-muted-foreground text-xs">Sin notas</span>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </ScrollArea>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CallLogDialog;
