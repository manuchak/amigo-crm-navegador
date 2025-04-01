
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { ShieldX, Home, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';

const Unauthorized = () => {
  const { signOut } = useAuth();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-gray-50 to-gray-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <div className="w-12 h-12 bg-destructive rounded-full flex items-center justify-center mb-4">
            <ShieldX className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Acceso no autorizado</CardTitle>
          <CardDescription className="text-center">
            No tienes los permisos necesarios para acceder a esta sección
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground">
            Tu cuenta no tiene los permisos necesarios para acceder a esta sección del sistema.
            Si crees que esto es un error, por favor contacta a un administrador.
          </p>
          
          <div className="flex flex-col space-y-2 mt-6">
            <Button asChild className="flex items-center justify-center gap-2">
              <Link to="/">
                <Home className="h-4 w-4" />
                <span>Ir a la página principal</span>
              </Link>
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

export default Unauthorized;
