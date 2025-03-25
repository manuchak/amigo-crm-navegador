
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

const Index = () => {
  const menuItems = [
    {
      title: 'Dashboard',
      description: 'Vista general del rendimiento',
      path: '/dashboard',
      color: 'bg-gradient-to-br from-purple-500 to-indigo-600',
      textColor: 'text-white'
    },
    {
      title: 'Leads',
      description: 'Gestión de nuevos prospectos',
      path: '/leads',
      color: 'bg-gradient-to-br from-blue-500 to-cyan-400',
      textColor: 'text-white'
    },
    {
      title: 'Requerimientos',
      description: 'Seguimiento de objetivos y métricas',
      path: '/requerimientos',
      color: 'bg-gradient-to-br from-emerald-500 to-teal-400',
      textColor: 'text-white'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col pt-20">
      <main className="flex-1 container mx-auto px-6 py-12">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 animate-fade-up">
            SimpleCRM
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-3xl mb-12 animate-fade-up animate-delay-100">
            Gestiona tus prospectos y ventas con simplicidad y elegancia
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-up animate-delay-200">
            {menuItems.map((item, index) => (
              <Link 
                key={item.path} 
                to={item.path}
                className="group transition-all-medium hover:scale-[1.02]"
              >
                <Card className={`h-full overflow-hidden ${item.color} shadow-lg border-0`}>
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="flex-1">
                      <h3 className={`text-2xl font-semibold mb-2 ${item.textColor}`}>{item.title}</h3>
                      <p className={`${item.textColor} opacity-90`}>{item.description}</p>
                    </div>
                    
                    <div className={`mt-6 flex justify-end ${item.textColor}`}>
                      <ArrowRight className="transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
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
