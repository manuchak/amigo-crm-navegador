
import React from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Clock, Play, FileText } from 'lucide-react';
import { VapiCallLog } from '../../types';
import { formatDateTime, formatDuration, getStatusBadge } from './CallLogUtils';

interface CallLogRowProps {
  log: VapiCallLog;
}

export const CallLogRow: React.FC<CallLogRowProps> = ({ log }) => {
  return (
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
  );
};
