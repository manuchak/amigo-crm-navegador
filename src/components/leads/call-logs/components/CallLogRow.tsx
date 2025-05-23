
import React from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { VapiCallLog } from '../../types';
import { formatCallDateTime, formatCallDuration, getBestPhoneNumber } from '@/components/shared/call-logs/utils';
import { CallStatusBadge } from '@/components/shared/call-logs/CallStatusBadge';
import { FileText, Play, PhoneCall } from 'lucide-react';

interface CallLogRowProps {
  log: VapiCallLog;
  onViewTranscript?: (log: VapiCallLog) => void;
}

export const CallLogRow: React.FC<CallLogRowProps> = ({
  log,
  onViewTranscript
}) => {
  const hasRecording = !!log.recording_url;
  const hasTranscript = !!log.transcript;

  const handlePlayRecording = () => {
    if (log.recording_url) {
      window.open(log.recording_url, '_blank');
    }
  };

  const handleViewTranscript = () => {
    if (onViewTranscript) {
      onViewTranscript(log);
    }
  };

  const phoneNumber = getBestPhoneNumber(log);

  return (
    <TableRow>
      <TableCell className="font-mono text-xs whitespace-nowrap">
        {formatCallDateTime(log.start_time)}
      </TableCell>
      <TableCell>
        <CallStatusBadge status={log.status} />
      </TableCell>
      <TableCell className="whitespace-nowrap">
        <div className="flex items-center gap-1">
          <PhoneCall className="h-3 w-3" />
          <span className="text-xs">
            {log.direction === 'inbound' ? 'Entrante' : 'Saliente'}
          </span>
        </div>
      </TableCell>
      <TableCell className="whitespace-nowrap text-xs">
        {formatCallDuration(log.duration)}
      </TableCell>
      <TableCell>
        {hasRecording ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePlayRecording}
            title="Reproducir grabación"
            className="h-7 w-7"
          >
            <Play className="h-3 w-3" />
          </Button>
        ) : (
          <span className="text-xs text-slate-400">-</span>
        )}
      </TableCell>
      <TableCell>
        {hasTranscript ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleViewTranscript}
            title="Ver transcripción"
            className="h-7 w-7"
          >
            <FileText className="h-3 w-3" />
          </Button>
        ) : (
          <span className="text-xs text-slate-400">-</span>
        )}
      </TableCell>
    </TableRow>
  );
};
