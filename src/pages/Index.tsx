
import React from 'react';
import { useAuth } from '@/context/auth/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { 
  LayoutGrid, Shield, Users, LifeBuoy, Car, Settings,
  CalendarCheck, ArrowUpRight, HelpCircle, Home
} from 'lucide-react';
import { motion } from 'framer-motion';

const Index = () => {
  const { currentUser } = useAuth();
  
  // Base menu items that will be filtered based on user role
  const menuItems = [
    {
      title: 'Dashboard',
      description: 'Vista general del rendimiento',
      path: '/dashboard',
      color: 'text-blue-500',
      icon: <LayoutGrid className="w-6 h-6" />,
      roles: ['admin', 'owner', 'atención_afiliado', 'supply', 'supply_admin', 'afiliados']
    },
    {
      title: 'Leads',
      description: 'Gestión de nuevos prospectos',
      path: '/leads',
      color: 'text-emerald-500',
      icon: <Users className="w-6 h-6" />,
      roles: ['admin', 'owner', 'supply', 'supply_admin', 'afiliados']
    },
    {
      title: 'Requerimientos',
      description: 'Seguimiento de objetivos y métricas',
      path: '/requerimientos',
      color: 'text-purple-500',
      icon: <Shield className="w-6 h-6" />,
      roles: ['admin', 'owner', 'supply', 'supply_admin']
    },
    {
      title: 'Instalación GPS',
      description: 'Registra instalaciones para clientes y custodios',
      path: '/instalacion-gps',
      color: 'text-indigo-500',
      icon: <Car className="w-6 h-6" />,
      roles: ['admin', 'owner', 'supply', 'supply_admin']
    },
    {
      title: 'Atención al Afiliado',
      description: 'Centro de atención y consultas',
      path: '/support',
      color: 'text-orange-500',
      icon: <LifeBuoy className="w-6 h-6" />,
      roles: ['admin', 'owner', 'atención_afiliado']
    },
    {
      title: 'Administración',
      description: 'Configuración del sistema y usuarios',
      path: '/admin-config',
      color: 'text-gray-500',
      icon: <Settings className="w-6 h-6" />,
      roles: ['admin', 'owner']
    },
    {
      title: 'Call Center',
      description: 'Gestión de llamadas y seguimiento',
      path: '/call-center',
      color: 'text-cyan-500',
      icon: <HelpCircle className="w-6 h-6" />,
      roles: ['admin', 'owner', 'atención_afiliado']
    },
    {
      title: 'Agenda',
      description: 'Calendario de instalaciones y eventos',
      path: '/instalaciones-agendadas',
      color: 'text-rose-500',
      icon: <CalendarCheck className="w-6 h-6" />,
      roles: ['admin', 'owner', 'supply', 'supply_admin']
    },
    {
      title: 'Performance',
      description: 'Métricas y análisis de desempeño',
      path: '/performance',
      color: 'text-amber-500',
      icon: <ArrowUpRight className="w-6 h-6" />,
      roles: ['admin', 'owner']
    }
  ];

  // Filter menu items based on user role
  const filteredMenuItems = currentUser
    ? menuItems.filter(item => item.roles.includes(currentUser.role))
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-7xl mx-auto space-y-10"
        >
          {/* Header Section */}
          <div className="text-center space-y-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm px-4 py-1.5 rounded-full border border-slate-200/50 dark:border-slate-700/50"
            >
              <Home className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Inicio
              </span>
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-gray-900 via-gray-800 to-gray-600 dark:from-gray-100 dark:via-gray-200 dark:to-gray-400 bg-clip-text text-transparent">
              CustodiosCRM
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Accede a todas las herramientas para gestionar custodios y afiliados de manera eficiente
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMenuItems.map((item, index) => (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="group"
              >
                <Card 
                  className="h-full hover:shadow-lg transition-all duration-300 border border-slate-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm overflow-hidden cursor-pointer"
                  onClick={() => window.location.href = item.path}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col h-full space-y-4">
                      <div className={`p-3 w-fit rounded-lg bg-white dark:bg-slate-700 backdrop-blur-sm shadow-sm ${item.color}`}>
                        {item.icon}
                      </div>
                      
                      <div>
                        <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 group-hover:text-slate-700 dark:group-hover:text-white transition-colors flex items-center gap-2">
                          {item.title}
                          <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </h3>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Index;
