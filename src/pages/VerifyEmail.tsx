
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { Mail, RefreshCw, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const VerifyEmail = () => {
  const { currentUser, signOut, refreshUserData } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
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
      
      // Create a verification link - in a real app this would include a token
      const host = window.location.origin;
      const verificationLink = `${host}/verify-token?email=${encodeURIComponent(currentUser.email)}&token=simulated-token`;
      
      // Send verification email using our edge function
      const response = await supabase.functions.invoke('verify-email', {
        body: {
          email: currentUser.email,
          name: currentUser.displayName || 'Usuario',
          verificationLink: verificationLink
        }
      });
      
      if (response.error) {
        console.error('Error invoking function:', response.error);
        throw new Error(response.error.message || 'Error sending verification email');
      }
      
      toast.success('Se ha enviado un nuevo correo de verificación');
      console.log('Verification email sent to:', currentUser.email);
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
      
      // In a real app, we would check with the server if the email has been verified
      await refreshUserData();
      
      // For demo purposes, we'll simulate email verification
      const updatedUser = JSON.parse(localStorage.getItem('current_user') || '{}');
      const verificationSimulation = Math.random() > 0.5; // 50% chance of "verification"
      
      if (verificationSimulation) {
        // Update local storage to mark email as verified
        updatedUser.emailVerified = true;
        localStorage.setItem('current_user', JSON.stringify(updatedUser));
        
        // Also update the user in the users list
        const users = JSON.parse(localStorage.getItem('local_users') || '[]');
        const updatedUsers = users.map(user => {
          if (user.uid === updatedUser.uid) {
            return { ...user, emailVerified: true };
          }
          return user;
        });
        localStorage.setItem('local_users', JSON.stringify(updatedUsers));
        
        // Refresh user data and redirect
        await refreshUserData();
        window.location.href = '/dashboard';
        toast.success('¡Correo verificado con éxito!');
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
