
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Shield, Users, LineChart, Settings, LifeBuoy, Car } from 'lucide-react';

const Index = () => {
  const menuItems = [
    {
      title: 'Dashboard',
      description: 'Vista general del rendimiento',
      path: '/dashboard',
      color: 'bg-gradient-to-br from-purple-500 to-indigo-600',
      textColor: 'text-white',
      icon: <LineChart className="w-5 h-5" />
    },
    {
      title: 'Leads',
      description: 'Gestión de nuevos prospectos',
      path: '/leads',
      color: 'bg-gradient-to-br from-blue-500 to-cyan-400',
      textColor: 'text-white',
      icon: <Users className="w-5 h-5" />
    },
    {
      title: 'Requerimientos',
      description: 'Seguimiento de objetivos y métricas',
      path: '/requerimientos',
      color: 'bg-gradient-to-br from-emerald-500 to-teal-400',
      textColor: 'text-white',
      icon: <Shield className="w-5 h-5" />
    },
    {
      title: 'Instalación GPS',
      description: 'Registra instalaciones para clientes y custodios',
      path: '/instalacion-gps',
      color: 'bg-gradient-to-br from-green-500 to-lime-400',
      textColor: 'text-white',
      icon: <Car className="w-5 h-5" />
    },
    {
      title: 'Atención al Afiliado',
      description: 'Centro de atención y consultas',
      path: '/support',
      color: 'bg-gradient-to-br from-blue-500 to-purple-400',
      textColor: 'text-white',
      icon: <LifeBuoy className="w-5 h-5" />
    },
    {
      title: 'Administración',
      description: 'Configuración del sistema y usuarios',
      path: '/admin-config',
      color: 'bg-gradient-to-br from-amber-500 to-orange-400',
      textColor: 'text-white',
      icon: <Settings className="w-5 h-5" />
    }
  ];

  return (
    <div className="min-h-screen flex flex-col pt-20">
      <main className="flex-1 container mx-auto px-6 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-6 animate-fade-up">
            <div className="bg-gradient-to-br from-primary to-accent rounded-full p-2.5 flex items-center justify-center">
              <Shield size={28} className="text-primary-foreground" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              CustodiosCRM
              <span className="block text-sm font-normal text-muted-foreground mt-1">by Detecta</span>
            </h1>
          </div>
          
          <p className="text-xl text-muted-foreground max-w-3xl mb-12 animate-fade-up animate-delay-100">
            Brindando la mejor atención a nuestros afiliados con tecnología de vanguardia
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
                    <div className="flex items-center gap-2 mb-4">
                      {item.icon}
                      <h3 className={`text-2xl font-semibold ${item.textColor}`}>{item.title}</h3>
                    </div>
                    <div className="flex-1">
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
        <p>© {new Date().getFullYear()} CustodiosCRM by Detecta. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
};

export default Index;
