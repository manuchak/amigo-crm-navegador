
import React from 'react';
import { Table, TableBody } from '@/components/ui/table';
import { VapiCallLog } from './types';
import { LoadingState, EmptyState, CallLogRow } from './components';
import { StandardTableHeaders, ExtendedTableHeaders } from './components/TableHeaders';

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
    return <LoadingState />;
  }
  
  if (filteredLogs.length === 0) {
    return <EmptyState onSyncCallLogs={onSyncCallLogs} syncing={syncing} />;
  }

  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        {columnView === 'extended' ? <ExtendedTableHeaders /> : <StandardTableHeaders />}
        <TableBody>
          {filteredLogs.map((log) => (
            <CallLogRow 
              key={log.id}
              log={log} 
              columnView={columnView} 
              onViewDetails={onViewDetails} 
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default CallLogsList;
