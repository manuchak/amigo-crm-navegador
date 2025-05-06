
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EmailSignInForm from '@/components/auth/EmailSignInForm';
import EmailSignUpForm from '@/components/auth/EmailSignUpForm';
import { useAuth } from '@/context/auth/AuthContext';
import { Shield, Loader2 } from 'lucide-react';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';

const Login = () => {
  const { currentUser, loading } = useAuth();
  const [authTab, setAuthTab] = useState('signin');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    console.log('Login component mounted', { currentUser, loading });
    
    // Only redirect if we have a user and we're not loading
    if (currentUser && !loading) {
      console.log('User authenticated, redirecting to dashboard', currentUser);
      navigate('/dashboard', { replace: true });
    }
  }, [currentUser, loading, navigate]);
  
  // Handle forgot password view
  const handleForgotPassword = () => {
    setShowForgotPassword(true);
  };
  
  const handleBackToLogin = () => {
    setShowForgotPassword(false);
  };
  
  const handleLoginSuccess = () => {
    console.log('Login successful, will redirect in useEffect hook');
  };
  
  // Render a simple loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
          <p className="text-muted-foreground">Verificando sesión...</p>
        </div>
      </div>
    );
  }
  
  // Render forgot password form
  if (showForgotPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="space-y-1 flex flex-col items-center">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-center">Restablecer contraseña</CardTitle>
            <CardDescription className="text-center">
              Ingresa tu correo electrónico para recibir instrucciones
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ForgotPasswordForm onBack={handleBackToLogin} />
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-4">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">CustodiosCRM</CardTitle>
          <CardDescription className="text-center">
            Inicia sesión o regístrate para acceder al sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={authTab} onValueChange={setAuthTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="signin">Ingresar</TabsTrigger>
              <TabsTrigger value="signup">Registrarse</TabsTrigger>
            </TabsList>
            <TabsContent value="signin">
              <EmailSignInForm 
                onForgotPassword={handleForgotPassword}
                onSuccess={handleLoginSuccess}
              />
            </TabsContent>
            <TabsContent value="signup">
              <EmailSignUpForm />
            </TabsContent>
          </Tabs>
          
          <div className="text-center text-sm mt-6 text-muted-foreground">
            Al iniciar sesión, aceptas nuestros términos y condiciones de servicio.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
