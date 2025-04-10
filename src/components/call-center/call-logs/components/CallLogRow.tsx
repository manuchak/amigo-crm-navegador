
import React from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react';
import { VapiCallLog } from '../types';
import { DirectionBadge, StatusBadge } from '../StatusBadges';
import { formatDate, formatDuration } from '../utils';
import { getBestPhoneNumber } from './PhoneNumberFormatter';

interface CallLogRowProps {
  log: VapiCallLog;
  columnView: 'standard' | 'extended';
  onViewDetails: (log: VapiCallLog) => void;
}

export const CallLogRow: React.FC<CallLogRowProps> = ({ log, columnView, onViewDetails }) => {
  if (columnView === 'extended') {
    return (
      <TableRow key={log.id} className="hover:bg-gray-50">
        <TableCell className="font-mono text-xs">
          {log.log_id?.substring(0, 8) || 'N/A'}...
        </TableCell>
        <TableCell>
          {log.assistant_name || 'VAPI Asistente'}
        </TableCell>
        <TableCell>
          {log.assistant_phone_number ? getBestPhoneNumber(log) : 'N/A'}
        </TableCell>
        <TableCell>
          {getBestPhoneNumber(log)}
        </TableCell>
        <TableCell>
          {log.call_type || 'N/A'}
        </TableCell>
        <TableCell>
          {log.duration !== null && log.duration !== undefined ? formatDuration(log.duration) : 'N/A'}
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
      </TableRow>
    );
  }
  
  return (
    <TableRow key={log.id} className="hover:bg-gray-50">
      <TableCell>
        <div className="flex items-center">
          <span>{formatDate(log.start_time)}</span>
        </div>
      </TableCell>
      <TableCell>
        {getBestPhoneNumber(log)}
      </TableCell>
      <TableCell>
        <DirectionBadge direction={log.direction} />
      </TableCell>
      <TableCell>
        {log.duration !== null && log.duration !== undefined ? formatDuration(log.duration) : 'N/A'}
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
    </TableRow>
  );
};
