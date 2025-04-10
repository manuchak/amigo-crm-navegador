
import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import EmailSignInForm from '@/components/auth/EmailSignInForm';
import EmailSignUpForm from '@/components/auth/EmailSignUpForm';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';
import { useAuth } from '@/context/AuthContext';
import { Shield, Loader2 } from 'lucide-react';

const Login = () => {
  const { currentUser, loading } = useAuth();
  const [authTab, setAuthTab] = useState<string>('signin');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect if already logged in
    if (currentUser) {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);
  
  // If we're still loading, show a loading indicator
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-gray-50 to-gray-100">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
          <p className="text-muted-foreground">Verificando sesión...</p>
        </div>
      </div>
    );
  }
  
  // If we already determined user is logged in above, don't render the login page
  if (currentUser) return null;
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-gray-50 to-gray-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-4">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">CustodiosCRM</CardTitle>
          <CardDescription className="text-center">
            {showForgotPassword 
              ? 'Ingresa tu correo para recuperar tu contraseña'
              : 'Inicia sesión o regístrate para acceder al sistema'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {showForgotPassword ? (
            <ForgotPasswordForm onCancel={() => setShowForgotPassword(false)} />
          ) : (
            <>
              <Tabs value={authTab} onValueChange={setAuthTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="signin">Ingresar</TabsTrigger>
                  <TabsTrigger value="signup">Registrarse</TabsTrigger>
                </TabsList>
                <TabsContent value="signin">
                  <EmailSignInForm 
                    onForgotPassword={() => setShowForgotPassword(true)}
                  />
                </TabsContent>
                <TabsContent value="signup">
                  <EmailSignUpForm />
                </TabsContent>
              </Tabs>
              
              <div className="text-center text-sm mt-6 text-muted-foreground">
                Al iniciar sesión, aceptas nuestros términos y condiciones de servicio.
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
