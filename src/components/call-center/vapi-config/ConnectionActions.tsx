
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, KeyRound } from 'lucide-react';

interface ConnectionActionsProps {
  testing: boolean;
  onTestConnection: () => void;
  onShowApiForm: () => void;
}

const ConnectionActions: React.FC<ConnectionActionsProps> = ({ 
  testing, 
  onTestConnection, 
  onShowApiForm 
}) => {
  return (
    <div className="flex flex-col gap-3">
      <Button 
        onClick={onTestConnection}
        disabled={testing}
        variant="outline"
      >
        {testing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
        Probar conexión VAPI
      </Button>
      
      <Button 
        onClick={onShowApiForm}
        variant="outline"
        className="bg-amber-50 border-amber-200 hover:bg-amber-100"
      >
        <KeyRound className="h-4 w-4 mr-2" />
        Actualizar clave API
      </Button>
    </div>
  );
};

export default ConnectionActions;
