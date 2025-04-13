
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertTriangle, CheckCircle } from 'lucide-react';

interface StatusAlertProps {
  keyStatus: 'checking' | 'not_found' | 'found' | 'error';
  testResult: { success: boolean; message: string; assistants_count?: number } | null;
}

const StatusAlert: React.FC<StatusAlertProps> = ({ keyStatus, testResult }) => {
  return (
    <>
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
    </>
  );
};

export default StatusAlert;
