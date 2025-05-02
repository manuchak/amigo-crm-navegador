
import React from 'react';
import { Loader2 } from 'lucide-react';

export const CallLogsLoadingState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
      <p className="text-sm text-muted-foreground">Cargando registros de llamadas...</p>
    </div>
  );
};
