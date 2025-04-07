
import React from 'react';
import { Button } from '@/components/ui/button';
import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, RefreshCw } from 'lucide-react';

interface CallLogsHeaderProps {
  limit: number;
  loading: boolean;
  syncing: boolean;
  onRefresh: () => void;
  onSync: () => void;
  columnView: 'standard' | 'extended';
  onToggleView: () => void;
}

const CallLogsHeader: React.FC<CallLogsHeaderProps> = ({
  limit,
  loading,
  syncing,
  onRefresh,
  onSync,
  columnView,
  onToggleView
}) => {
  return (
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <div>
        <CardTitle className="text-xl">Registros de Llamadas VAPI</CardTitle>
        <CardDescription>
          Historial de las últimas {limit} llamadas procesadas por VAPI AI
        </CardDescription>
      </div>
      <div className="flex space-x-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onToggleView}
        >
          {columnView === 'standard' ? 'Ver detalles extendidos' : 'Vista estándar'}
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRefresh}
          disabled={loading || syncing}
        >
          <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
        <Button 
          size="sm" 
          onClick={onSync}
          disabled={syncing}
        >
          <Loader2 className={`h-4 w-4 mr-1 ${syncing ? 'animate-spin' : ''}`} />
          Sincronizar con API
        </Button>
      </div>
    </CardHeader>
  );
};

export default CallLogsHeader;
