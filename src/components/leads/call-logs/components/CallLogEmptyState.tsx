
import React from 'react';
import { Phone } from 'lucide-react';

export const CallLogEmptyState: React.FC = () => {
  return (
    <div className="text-center py-8 text-slate-400 flex flex-col items-center">
      <Phone className="h-8 w-8 mb-2 opacity-30" />
      <p>No hay registros de llamadas para este custodio</p>
      <p className="text-xs mt-2 max-w-md text-center">
        Si ya se han realizado llamadas, es posible que los números no coincidan 
        exactamente en los registros. Intente sincronizar los registros de VAPI.
      </p>
    </div>
  );
};
