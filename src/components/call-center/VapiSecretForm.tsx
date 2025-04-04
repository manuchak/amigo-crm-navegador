
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface VapiSecretFormProps {
  onSuccess?: () => void;
}

const VapiSecretForm: React.FC<VapiSecretFormProps> = ({ onSuccess }) => {
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      setError('La clave API no puede estar vacía');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // First validate the API key by making a test call to the VAPI API
      console.log("Validating API key with VAPI directly...");
      const response = await fetch('https://api.vapi.ai/assistants', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`La clave API parece ser inválida: ${response.status} ${response.statusText}`);
      }
      
      console.log("API key is valid, storing in database...");
      
      // If valid, store it in Supabase
      const { data, error: functionError } = await supabase.functions.invoke('store-vapi-key', {
        body: { apiKey },
      });
      
      if (functionError) {
        console.error("Error invoking edge function:", functionError);
        throw new Error(functionError.message || 'Error guardando la clave API');
      }
      
      if (!data?.success) {
        console.error("Edge function returned error:", data);
        throw new Error(data?.message || 'Error guardando la clave API');
      }
      
      console.log("API key stored successfully!");
      setSuccess(true);
      setApiKey('');
      toast.success('La clave API de VAPI se ha guardado correctamente');
      
      // Call the success callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error('Error saving VAPI API key:', err);
      setError(err.message || 'Error al guardar la clave API');
      toast.error(`Error: ${err.message || 'Error al guardar la clave API'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Configurar VAPI API</CardTitle>
        <CardDescription>
          Ingresa tu clave API de VAPI para habilitar las funciones de llamadas automatizadas
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert className="bg-green-50 border-green-500 text-green-800">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Éxito</AlertTitle>
            <AlertDescription className="text-green-700">
              La clave API se ha guardado correctamente
            </AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-2">
          <label htmlFor="apiKey" className="text-sm font-medium text-gray-700">
            Clave API de VAPI
          </label>
          <Input
            id="apiKey"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="vapi_xxxxxxxxxxxxxxxx"
            className="w-full"
          />
          <p className="text-xs text-gray-500">
            Puedes encontrar tu clave API en la configuración de tu cuenta VAPI.
          </p>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-end">
        <Button 
          onClick={handleSaveApiKey} 
          disabled={loading || !apiKey.trim()}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Guardando...
            </>
          ) : (
            'Guardar clave API'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default VapiSecretForm;
