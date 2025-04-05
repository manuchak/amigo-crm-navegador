
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Loader2, AlertTriangle, CheckCircle, KeyRound } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import VapiSecretForm from './VapiSecretForm';

interface VapiConfigPanelProps {
  onConfigUpdate?: (isConfigured: boolean) => void;
}

const VapiConfigPanel: React.FC<VapiConfigPanelProps> = ({ onConfigUpdate }) => {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{success: boolean; message: string; assistants_count?: number} | null>(null);
  const [showApiForm, setShowApiForm] = useState(false);

  // On mount, automatically test the connection to determine if VAPI is configured
  useEffect(() => {
    testVapiConnection();
  }, []);

  const testVapiConnection = async () => {
    setTesting(true);
    setTestResult(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('test-vapi-connection', {
        method: 'POST',
        body: {}
      });
      
      if (error) {
        throw error;
      }
      
      setTestResult(data);
      
      // Call onConfigUpdate if provided
      if (onConfigUpdate) {
        onConfigUpdate(data.success);
      }
      
      if (data.success) {
        toast.success('Conexión con VAPI exitosa');
      } else {
        toast.error(data.message || 'Error conectando con VAPI');
      }
    } catch (error) {
      console.error('Error testing VAPI connection:', error);
      
      // In case of error, we consider the API not configured
      if (onConfigUpdate) {
        onConfigUpdate(false);
      }
      
      setTestResult({
        success: false,
        message: error.message || 'Error conectando con VAPI'
      });
      toast.error('Error probando la conexión con VAPI');
    } finally {
      setTesting(false);
    }
  };

  const syncVapiLogs = async () => {
    setTesting(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('fetch-vapi-logs', {
        method: 'POST',
        body: { full_refresh: true }
      });
      
      if (error) {
        throw error;
      }
      
      if (data.success) {
        toast.success(`${data.message || 'Logs sincronizados correctamente'}`);
      } else {
        throw new Error(data.message || 'Error sincronizando logs');
      }
    } catch (error) {
      console.error('Error syncing VAPI logs:', error);
      toast.error(error.message || 'Error sincronizando logs de VAPI');
    } finally {
      setTesting(false);
    }
  };

  const handleApiFormSuccess = () => {
    setShowApiForm(false);
    // Wait a moment before testing to ensure the API key is saved
    setTimeout(() => {
      testVapiConnection();
    }, 1500);
  };

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
        {testResult && (
          <Alert variant={testResult.success ? "success" : "destructive"} className={
            testResult.success ? "bg-green-50 border-green-500" : ""
          }>
            {testResult.success ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertTriangle className="h-4 w-4" />
            )}
            <AlertTitle>{testResult.success ? 'Conexión exitosa' : 'Error de conexión'}</AlertTitle>
            <AlertDescription>
              {testResult.message}
              {testResult.success && testResult.assistants_count !== undefined && (
                <div className="mt-1 text-sm">
                  Asistentes disponibles: {testResult.assistants_count}
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}
        
        <div className="flex flex-col gap-3">
          <Button 
            onClick={testVapiConnection}
            disabled={testing}
            variant="outline"
          >
            {testing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Probar conexión VAPI
          </Button>
          
          <Button 
            onClick={() => setShowApiForm(true)}
            variant="outline"
            className="bg-amber-50 border-amber-200 hover:bg-amber-100"
          >
            <KeyRound className="h-4 w-4 mr-2" />
            Actualizar clave API
          </Button>
        </div>
        
        <Separator className="my-4" />
        
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Sincronización de registros</h3>
          <p className="text-sm text-muted-foreground">
            Los registros de llamadas se sincronizan automáticamente cada 5 minutos.
            También puedes forzar una sincronización manual.
          </p>
          
          <Button 
            onClick={syncVapiLogs}
            disabled={testing || testResult?.success !== true}
            className="mt-2"
          >
            {testing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Sincronizar registros ahora
          </Button>
        </div>
      </CardContent>
      
      {showApiForm && (
        <CardFooter className="flex flex-col border-t pt-4">
          <VapiSecretForm onSuccess={handleApiFormSuccess} />
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
