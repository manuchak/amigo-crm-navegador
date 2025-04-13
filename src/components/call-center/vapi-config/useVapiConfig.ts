
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useVapiConfig(onConfigUpdate?: (isConfigured: boolean) => void) {
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

  return {
    testing,
    testResult,
    showApiForm,
    keyStatus,
    defaultApiKey,
    setShowApiForm,
    testVapiConnection,
    syncVapiLogs,
    handleApiFormSuccess
  };
}
