
import React from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { VapiCallLog } from '../../types';
import { 
  formatDateTime, 
  formatDuration, 
  getStatusBadge,
  getBestPhoneNumber
} from './CallLogUtils';
import { FileText, Play, PhoneCall, ExternalLink } from 'lucide-react';

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

  return (
    <TableRow>
      <TableCell className="font-mono text-xs whitespace-nowrap">
        {formatDateTime(log.start_time)}
      </TableCell>
      <TableCell>
        {getStatusBadge(log.status)}
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
        {formatDuration(log.duration)}
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
