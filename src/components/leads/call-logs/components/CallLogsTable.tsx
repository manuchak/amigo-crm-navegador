
import React from 'react';
import { Table, TableBody, TableHeader, TableHead, TableRow } from '@/components/ui/table';
import { VapiCallLog } from '../../types';
import { CallLogRow } from './CallLogRow';

interface CallLogsTableProps {
  callLogs: VapiCallLog[];
}

export const CallLogsTable: React.FC<CallLogsTableProps> = ({ callLogs }) => {
  return (
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
          <CallLogRow key={log.id} log={log} />
        ))}
      </TableBody>
    </Table>
  );
};
