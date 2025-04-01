
import React from 'react';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import SignInWithGoogleButton from '@/components/auth/SignInWithGoogleButton';
import { useAuth } from '@/context/AuthContext';
import { Shield } from 'lucide-react';

const Login = () => {
  const { currentUser, userData } = useAuth();
  
  // Redirect if already logged in and verified
  if (currentUser && currentUser.emailVerified) {
    if (userData?.role === 'pending') {
      return <Navigate to="/pending-approval" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }
  
  // Redirect to verify email page if logged in but not verified
  if (currentUser && !currentUser.emailVerified) {
    return <Navigate to="/verify-email" replace />;
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-gray-50 to-gray-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-4">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">CustodiosCRM</CardTitle>
          <CardDescription className="text-center">
            Inicia sesión para acceder al sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SignInWithGoogleButton />
          
          <div className="text-center text-sm mt-6 text-muted-foreground">
            Al iniciar sesión, aceptas nuestros términos y condiciones de servicio.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
