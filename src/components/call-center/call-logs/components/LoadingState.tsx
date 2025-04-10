
import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingState: React.FC = () => {
  return (
    <div className="flex justify-center items-center py-10">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
      <span className="ml-2">Cargando registros de llamadas...</span>
    </div>
  );
};
