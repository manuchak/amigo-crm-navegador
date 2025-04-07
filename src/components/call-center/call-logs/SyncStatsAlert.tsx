
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { SyncStats } from './types';

interface SyncStatsAlertProps {
  syncStats: SyncStats;
}

const SyncStatsAlert: React.FC<SyncStatsAlertProps> = ({ syncStats }) => {
  if (!syncStats) return null;
  
  return (
    <Alert className="mb-4 bg-primary/10">
      <AlertDescription className="text-sm text-primary-foreground">
        <div className="flex justify-between items-center">
          <span>Última sincronización:</span>
          <div className="flex space-x-4">
            <div className="flex items-center">
              <Badge variant="outline" className="mr-2">Total: {syncStats.total}</Badge>
              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                Nuevos: {syncStats.inserted}
              </Badge>
            </div>
            <div className="flex items-center">
              <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200 mr-2">
                Actualizados: {syncStats.updated}
              </Badge>
              {syncStats.errors > 0 && (
                <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
                  Errores: {syncStats.errors}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default SyncStatsAlert;
