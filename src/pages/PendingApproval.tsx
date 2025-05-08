
import React from 'react';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth'; // Updated import path
import { Clock, RefreshCw, LogOut } from 'lucide-react';

const PendingApproval = () => {
  const { currentUser, userData, signOut, refreshUserData } = useAuth();
  
  // Redirect if not logged in
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  // Redirect if email not verified
  if (!currentUser.emailVerified) {
    return <Navigate to="/verify-email" replace />;
  }
  
  // Redirect if already approved with a role other than pending
  if (userData && userData.role !== 'pending' && userData.role !== 'unverified') {
    return <Navigate to="/dashboard" replace />;
  }
  
  const handleRefresh = async () => {
    await refreshUserData();
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-gray-50 to-gray-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mb-4">
            <Clock className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Cuenta pendiente de aprobación</CardTitle>
          <CardDescription className="text-center">
            Tu cuenta está siendo revisada por un administrador
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground">
            Gracias por registrarte en CustodiosCRM. Tu cuenta ha sido creada exitosamente
            y está pendiente de aprobación por un administrador del sistema.
          </p>
          
          <p className="text-sm text-muted-foreground">
            Serás notificado cuando tu cuenta sea aprobada. Si tienes alguna pregunta,
            por favor contacta al soporte técnico.
          </p>
          
          <div className="flex flex-col space-y-2 mt-6">
            <Button onClick={handleRefresh} className="flex items-center justify-center gap-2">
              <RefreshCw className="h-4 w-4" />
              <span>Comprobar estado de aprobación</span>
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

export default PendingApproval;
