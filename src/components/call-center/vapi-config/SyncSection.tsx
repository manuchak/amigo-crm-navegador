
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface SyncSectionProps {
  testing: boolean;
  testResult: { success: boolean } | null;
  onSyncVapiLogs: () => Promise<void>;
}

const SyncSection: React.FC<SyncSectionProps> = ({ 
  testing, 
  testResult, 
  onSyncVapiLogs 
}) => {
  return (
    <>
      <Separator className="my-4" />
      
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Sincronización de registros</h3>
        <p className="text-sm text-muted-foreground">
          Los registros de llamadas se sincronizan automáticamente cada 5 minutos.
          También puedes forzar una sincronización manual.
        </p>
        
        <Button 
          onClick={onSyncVapiLogs}
          disabled={testing || testResult?.success !== true}
          className="mt-2"
        >
          {testing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Sincronizar registros ahora
        </Button>
      </div>
    </>
  );
};

export default SyncSection;
