
import React from 'react';
import { PhoneOff } from 'lucide-react';

export const CallLogEmptyState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
        <PhoneOff className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold">Sin registros de llamadas</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-md">
        Este contacto no tiene registros de llamadas aún.
      </p>
    </div>
  );
};
