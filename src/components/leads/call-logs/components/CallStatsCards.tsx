
import React from 'react';
import { VapiCallLog } from '../../types';
import { formatDuration } from './CallLogUtils';

interface CallStatsCardsProps {
  callLogs: VapiCallLog[];
}

export const CallStatsCards: React.FC<CallStatsCardsProps> = ({ callLogs }) => {
  return (
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
  );
};
