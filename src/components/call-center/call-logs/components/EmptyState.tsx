
import React from 'react';
import { Phone, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  onSyncCallLogs: () => void;
  syncing: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onSyncCallLogs, syncing }) => {
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
        {syncing ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Sincronizando...
          </>
        ) : (
          <>Sincronizar desde VAPI</>
        )}
      </Button>
    </div>
  );
};
