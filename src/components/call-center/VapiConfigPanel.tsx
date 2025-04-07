import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  const [keyStatus, setKeyStatus] = useState<'checking' | 'not_found' | 'found' | 'error'>('checking');
  const defaultApiKey = '4e1d9a9c-de28-4e68-926c-3b5ca5a3ecb9';

  // On mount, check if the VAPI key exists and automatically save it if not
  useEffect(() => {
    checkVapiKeyExists();
  }, []);

  const checkVapiKeyExists = async () => {
    setKeyStatus('checking');
    try {
      // Check if key exists in database first
      const { data, error } = await supabase
        .from('secrets')
        .select('value')
        .eq('name', 'VAPI_API_KEY' as any)
        .maybeSingle();
        
      if (error) {
        console.error('Error checking VAPI key in database:', error);
        setKeyStatus('error');
        return;
      }
      
      if (!data) {
        console.log('VAPI key not found in database, will attempt to save the default key');
        setKeyStatus('not_found');
        
        // Automatically save the default key
        const { data: storeData, error: storeError } = await supabase.functions.invoke('store-vapi-key', {
          body: { apiKey: defaultApiKey },
        });
        
        if (storeError || !storeData?.success) {
          console.error('Failed to auto-save VAPI key:', storeError || storeData);
          toast.error('No se pudo guardar la clave API automáticamente');
          setKeyStatus('error');
        } else {
          console.log('VAPI key saved automatically');
          toast.success('Clave API guardada automáticamente');
          setKeyStatus('found');
          testVapiConnection(); // Test the connection after saving
        }
      } else {
        setKeyStatus('found');
        testVapiConnection(); // Test the connection since key exists
      }
    } catch (err) {
      console.error('Error checking VAPI key:', err);
      setKeyStatus('error');
    }
  };

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
        {keyStatus === 'checking' && (
          <Alert className="bg-blue-50 border-blue-200">
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            <AlertTitle className="text-blue-800">Verificando configuración</AlertTitle>
            <AlertDescription className="text-blue-700">
              Comprobando si la clave API de VAPI está configurada...
            </AlertDescription>
          </Alert>
        )}
        
        {keyStatus === 'not_found' && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Clave API no encontrada</AlertTitle>
            <AlertDescription>
              La clave API de VAPI no está configurada. Intentando configurar automáticamente...
            </AlertDescription>
          </Alert>
        )}
        
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
