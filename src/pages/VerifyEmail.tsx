import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth'; // Updated import path
import { Mail, RefreshCw, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const VerifyEmail = () => {
  const { currentUser, signOut, refreshUserData } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check for custom verification link from query parameters
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token');
    const type = queryParams.get('type');
    
    if (token && type === 'email_confirmation') {
      handleCustomVerification(token);
    }
  }, [location]);
  
  const handleCustomVerification = async (token: string) => {
    try {
      setIsLoading(true);
      
      // Apply the token to complete verification
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'email_change'
      });
      
      if (error) {
        console.error('Error verifying email:', error);
        toast.error('Error al verificar el correo electrónico: ' + error.message);
      } else {
        toast.success('¡Correo verificado con éxito!');
        await refreshUserData();
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error in custom verification:', error);
      toast.error('Error al procesar la verificación');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Redirect if not logged in
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  // Redirect if already verified
  if (currentUser.emailVerified) {
    return <Navigate to="/dashboard" replace />;
  }
  
  const handleResendVerification = async () => {
    try {
      setIsLoading(true);
      
      // Get the correct origin for redirects
      const redirectURL = `${window.location.origin}/verify-confirmation`;
      
      // Use resetPasswordForEmail which also can be used for verification emails
      const { data, error } = await supabase.auth.resetPasswordForEmail(currentUser.email, {
        redirectTo: redirectURL,
      });
      
      if (error) {
        throw error;
      }
      
      toast.success('Correo de verificación enviado. Por favor revisa tu bandeja de entrada.');
      
    } catch (error) {
      console.error('Error sending verification email:', error);
      toast.error('Error al enviar el correo de verificación');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setIsLoading(true);
      await refreshUserData();
      
      // Check if the email is now verified
      const { data } = await supabase.auth.getUser();
      if (data.user?.email_confirmed_at) {
        toast.success('¡Correo verificado con éxito!');
        navigate('/dashboard');
      } else {
        toast.info('El correo electrónico aún no ha sido verificado');
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
      toast.error('Error al actualizar la información del usuario');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-gray-50 to-gray-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-4">
            <Mail className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Verifica tu correo electrónico</CardTitle>
          <CardDescription className="text-center">
            Hemos enviado un enlace de verificación a <span className="font-semibold">{currentUser.email}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground">
            Por favor, revisa tu bandeja de entrada y haz clic en el enlace de verificación para continuar.
            Verifica también tu carpeta de spam si no lo encuentras.
          </p>
          
          <div className="flex flex-col space-y-2 mt-6">
            <Button 
              onClick={handleResendVerification} 
              variant="outline" 
              className="flex items-center justify-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Mail className="h-4 w-4" />
              )}
              <span>Reenviar correo de verificación</span>
            </Button>
            
            <Button 
              onClick={handleRefresh} 
              className="flex items-center justify-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              <span>Ya verifiqué mi correo</span>
            </Button>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={signOut} variant="ghost" className="w-full flex items-center justify-center gap-2">
            <LogOut className="h-4 w-4" />
            <span>Cerrar sesión</span>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default VerifyEmail;
