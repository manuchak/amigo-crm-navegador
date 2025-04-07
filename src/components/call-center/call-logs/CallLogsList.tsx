
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Info, Loader2, Phone } from 'lucide-react';
import { VapiCallLog } from './types';
import { DirectionBadge, StatusBadge } from './StatusBadges';
import { formatDate, formatDuration } from './utils';

interface CallLogsListProps {
  filteredLogs: VapiCallLog[];
  columnView: 'standard' | 'extended';
  loading: boolean;
  onViewDetails: (log: VapiCallLog) => void;
  onSyncCallLogs: () => void;
  syncing: boolean;
}

const CallLogsList: React.FC<CallLogsListProps> = ({ 
  filteredLogs, 
  columnView, 
  loading, 
  onViewDetails, 
  onSyncCallLogs,
  syncing
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2">Cargando registros de llamadas...</span>
      </div>
    );
  }
  
  if (filteredLogs.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        <Phone className="h-10 w-10 mx-auto mb-2 opacity-30" />
        <p>No hay registros de llamadas disponibles</p>
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-4" 
          onClick={onSyncCallLogs}
          disabled={syncing}
        >
          Sincronizar desde VAPI
        </Button>
      </div>
    );
  }

  return (
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
                    <StatusBadge status={log.status} />
                  </TableCell>
                  <TableCell>
                    {log.ended_reason || 'N/A'}
                  </TableCell>
                  <TableCell>
                    {log.cost !== null ? `$${log.cost.toFixed(3)} USD` : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {formatDate(log.start_time)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={log.success_evaluation} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onViewDetails(log)}
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
                      <span>{formatDate(log.start_time)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {log.customer_number || log.caller_phone_number || log.phone_number || 'Desconocido'}
                  </TableCell>
                  <TableCell>
                    <DirectionBadge direction={log.direction} />
                  </TableCell>
                  <TableCell>
                    {log.duration !== null ? formatDuration(log.duration) : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={log.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onViewDetails(log)}
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
  );
};

export default CallLogsList;
