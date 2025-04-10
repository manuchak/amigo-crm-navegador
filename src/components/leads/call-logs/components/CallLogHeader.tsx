
import React from 'react';
import { Phone } from 'lucide-react';
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { formatPhoneNumber } from './CallLogUtils';

interface CallLogHeaderProps {
  leadName: string;
  leadPhone: string | null;
}

export const CallLogHeader: React.FC<CallLogHeaderProps> = ({ leadName, leadPhone }) => {
  return (
    <DialogHeader className="px-6 pt-6 pb-2">
      <DialogTitle className="flex items-center gap-2 text-lg font-medium">
        <Phone className="h-4 w-4 text-primary" />
        Historial de llamadas: {leadName}
      </DialogTitle>
      <DialogDescription className="text-sm text-slate-500">
        {leadPhone ? `Teléfono: ${formatPhoneNumber(leadPhone)}` : 'Sin número de teléfono registrado'}
      </DialogDescription>
    </DialogHeader>
  );
};
