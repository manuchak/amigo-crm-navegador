
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { formatPhoneNumber } from '@/lib/utils';

interface CallLogHeaderProps {
  leadName: string;
  leadPhone: string | null;
}

export const CallLogHeader: React.FC<CallLogHeaderProps> = ({ 
  leadName, 
  leadPhone 
}) => {
  return (
    <div className="border-b p-6">
      <h2 className="text-xl font-semibold">Historial de llamadas</h2>
      <div className="flex items-center mt-1 text-sm text-muted-foreground">
        <span>{leadName}</span>
        {leadPhone && (
          <>
            <span className="mx-1.5">•</span>
            <Badge variant="outline" className="font-mono">
              {formatPhoneNumber(leadPhone)}
            </Badge>
          </>
        )}
      </div>
    </div>
  );
};
