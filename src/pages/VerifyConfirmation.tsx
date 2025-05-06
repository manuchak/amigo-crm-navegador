
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Loader2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

const VerifyConfirmation: React.FC = () => {
  const navigate = useNavigate();
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verificando tu correo electrónico...');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Comprobar si hay un token en la URL
        const hashParams = window.location.hash.substring(1);
        if (hashParams) {
          const params = new URLSearchParams(hashParams);
          const type = params.get('type');
          const accessToken = params.get('access_token');
          
          if (type === 'signup' && accessToken) {
            // Con Supabase, la verificación debería estar ya realizada si llegamos a esta página
            // El token en la URL confirma que el correo fue verificado
            setVerificationStatus('success');
            setMessage('¡Tu correo electrónico ha sido verificado con éxito!');
            
            // Actualizar la sesión
            await supabase.auth.getSession();
            
            // Redirigir al dashboard después de unos segundos
            setTimeout(() => {
              navigate('/dashboard');
            }, 3000);
            return;
          }
        }
        
        // Si no hay token o no es del tipo correcto
        setVerificationStatus('error');
        setMessage('No se pudo verificar tu correo electrónico. El enlace puede haber expirado o no ser válido.');
      } catch (error) {
        console.error('Error al verificar correo:', error);
        setVerificationStatus('error');
        setMessage('Ocurrió un error al verificar tu correo electrónico.');
      }
    };

    verifyEmail();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-4">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Verificación de correo
          </CardTitle>
          <CardDescription className="text-center">
            Verificando tu dirección de correo electrónico
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-8">
            {verificationStatus === 'loading' && (
              <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
              </div>
            )}
            
            {verificationStatus === 'success' && (
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Check className="h-6 w-6 text-green-600" />
              </div>
            )}
            
            {verificationStatus === 'error' && (
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <X className="h-6 w-6 text-red-600" />
              </div>
            )}
            
            <h3 className="text-lg font-medium text-gray-900">
              {verificationStatus === 'loading' ? 'Verificando...' : 
                verificationStatus === 'success' ? '¡Verificación exitosa!' : 'Error de verificación'}
            </h3>
            
            <p className="mt-2 text-sm text-gray-600">
              {message}
            </p>
            
            {verificationStatus === 'error' && (
              <Button 
                onClick={() => navigate('/login')} 
                className="mt-4"
              >
                Volver a iniciar sesión
              </Button>
            )}
            
            {verificationStatus === 'success' && (
              <p className="mt-4 text-sm text-gray-500">
                Serás redirigido al dashboard en unos segundos...
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyConfirmation;
