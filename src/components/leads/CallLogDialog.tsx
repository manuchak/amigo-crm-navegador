
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
import { Phone, Clock } from 'lucide-react';
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
        return <Badge className="bg-green-500 font-normal">Contactado</Badge>;
      case 'no contestó':
        return <Badge variant="outline" className="border-amber-500 text-amber-700 font-normal">No contestó</Badge>;
      case 'número equivocado':
        return <Badge variant="destructive" className="font-normal">Número equivocado</Badge>;
      case 'buzón':
        return <Badge variant="outline" className="border-blue-500 text-blue-700 font-normal">Buzón</Badge>;
      default:
        return <Badge variant="secondary" className="font-normal">{result}</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-0 shadow-lg rounded-xl">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="flex items-center gap-2 text-lg font-medium">
            <Phone className="h-4 w-4 text-primary" />
            Historial: {leadName}
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500">
            Registro de comunicaciones con este custodio
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[300px] px-6">
          {callLogs.length === 0 ? (
            <div className="text-center py-8 text-slate-400 flex flex-col items-center">
              <Phone className="h-8 w-8 mb-2 opacity-30" />
              <p>No hay registros de llamadas para este custodio</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Fecha</TableHead>
                  <TableHead className="text-xs">Hora</TableHead>
                  <TableHead className="text-xs">Duración</TableHead>
                  <TableHead className="text-xs">Resultado</TableHead>
                  <TableHead className="text-xs">Notas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {callLogs.map((log) => (
                  <TableRow key={log.id} className="text-sm">
                    <TableCell className="py-2">{log.fechaLlamada}</TableCell>
                    <TableCell className="py-2">{log.horaLlamada}</TableCell>
                    <TableCell className="py-2 flex items-center gap-1">
                      <Clock className="h-3 w-3 text-slate-400" /> {log.duracion}
                    </TableCell>
                    <TableCell className="py-2">{getResultBadge(log.resultado)}</TableCell>
                    <TableCell className="py-2 max-w-[150px] truncate">
                      {log.notas ? log.notas : <span className="text-slate-400 text-xs">Sin notas</span>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </ScrollArea>
        
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
