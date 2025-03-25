
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight animate-fade-up">
            Administra tus clientes con simplicidad y elegancia
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-up animate-delay-100">
            SimpleCRM te ayuda a gestionar tus clientes a través de cada etapa del proceso de venta con una interfaz intuitiva y potente.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 animate-fade-up animate-delay-200">
            <Button asChild size="lg" className="rounded-full px-8">
              <Link to="/dashboard">Comenzar</Link>
            </Button>
            
            <Button asChild variant="outline" size="lg" className="rounded-full px-8">
              <Link to="/clients">Ver Clientes</Link>
            </Button>
          </div>
        </div>
      </main>
      
      <footer className="py-6 border-t text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} SimpleCRM. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
};

export default Index;
