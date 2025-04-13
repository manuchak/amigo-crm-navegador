
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { KeyRound } from 'lucide-react';
import VapiSecretForm from '../VapiSecretForm';
import StatusAlert from './StatusAlert';
import ConnectionActions from './ConnectionActions';
import SyncSection from './SyncSection';
import { useVapiConfig } from './useVapiConfig';

interface VapiConfigPanelProps {
  onConfigUpdate?: (isConfigured: boolean) => void;
}

const VapiConfigPanel: React.FC<VapiConfigPanelProps> = ({ onConfigUpdate }) => {
  const {
    testing,
    testResult,
    showApiForm,
    keyStatus,
    defaultApiKey,
    setShowApiForm,
    testVapiConnection,
    syncVapiLogs,
    handleApiFormSuccess
  } = useVapiConfig(onConfigUpdate);

  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <KeyRound className="h-5 w-5 text-amber-500" />
          Configuración de VAPI API
        </CardTitle>
        <CardDescription>
          Administrar la conexión con la API de llamadas VAPI para el centro de llamadas
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <StatusAlert keyStatus={keyStatus} testResult={testResult} />
        
        <ConnectionActions 
          testing={testing} 
          onTestConnection={testVapiConnection} 
          onShowApiForm={() => setShowApiForm(true)} 
        />
        
        <SyncSection 
          testing={testing} 
          testResult={testResult} 
          onSyncVapiLogs={syncVapiLogs} 
        />
      </CardContent>
      
      {showApiForm && (
        <CardFooter className="flex flex-col border-t pt-4">
          <VapiSecretForm onSuccess={handleApiFormSuccess} defaultApiKey={defaultApiKey} />
          <Button 
            variant="ghost" 
            className="mt-2" 
            onClick={() => setShowApiForm(false)}
          >
            Cancelar
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default VapiConfigPanel;
