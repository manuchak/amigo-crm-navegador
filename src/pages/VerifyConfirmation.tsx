
import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { CheckCircle, RefreshCw, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const VerifyConfirmation = () => {
  const { refreshUserData } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    const handleVerification = async () => {
      try {
        setIsLoading(true);
        
        // Get token from URL if present
        const hashParams = new URLSearchParams(location.hash.substring(1));
        const type = hashParams.get('type');
        const accessToken = hashParams.get('access_token');
        
        if (accessToken && type === 'recovery') {
          // Handle email verification via token in URL
          const { data, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            throw sessionError;
          }
          
          // Token is automatically applied by Supabase client
          // Refresh user data
          await refreshUserData();
          
          setIsSuccess(true);
          toast.success('¡Correo electrónico verificado con éxito!');
        } else {
          // If no valid parameters, show error
          setError('No se pudo verificar el correo electrónico. Link inválido o expirado.');
        }
      } catch (error: any) {
        console.error('Error in verification confirmation:', error);
        setError(error.message || 'Error al verificar el correo electrónico');
        toast.error('Error al verificar el correo electrónico');
      } finally {
        setIsLoading(false);
      }
    };
    
    handleVerification();
  }, [location, refreshUserData]);
  
  const handleContinue = () => {
    navigate('/dashboard');
  };
  
  const handleRetry = () => {
    navigate('/verify-email');
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-gray-50 to-gray-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 flex flex-col items-center">
          {isLoading ? (
            <RefreshCw className="h-12 w-12 text-primary animate-spin" />
          ) : isSuccess ? (
            <CheckCircle className="h-12 w-12 text-green-500" />
          ) : (
            <AlertTriangle className="h-12 w-12 text-amber-500" />
          )}
          
          <CardTitle className="text-2xl font-bold text-center mt-4">
            {isLoading ? 'Verificando...' : isSuccess ? 'Verificación Exitosa' : 'Error de Verificación'}
          </CardTitle>
          
          <CardDescription className="text-center">
            {isLoading ? 'Estamos procesando tu verificación' : 
             isSuccess ? 'Tu correo electrónico ha sido verificado correctamente' : 
             error || 'Ocurrió un error durante la verificación'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4 text-center">
          {!isLoading && (
            <Button 
              onClick={isSuccess ? handleContinue : handleRetry} 
              className="w-full"
            >
              {isSuccess ? 'Continuar' : 'Intentar de nuevo'}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyConfirmation;
