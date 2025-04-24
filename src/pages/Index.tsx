
import React from 'react';
import { useAuth } from '@/context/auth/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { 
  LayoutGrid, Shield, Users, LifeBuoy, Car, Settings,
  CalendarCheck, ArrowUpRight, HelpCircle, Home
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  // Base menu items that will be filtered based on user role
  const menuItems = [
    {
      title: 'Dashboard',
      description: 'Vista general del rendimiento',
      path: '/dashboard',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      icon: <LayoutGrid className="w-6 h-6" />,
      roles: ['admin', 'owner', 'atención_afiliado', 'supply', 'supply_admin', 'afiliados']
    },
    {
      title: 'Leads',
      description: 'Gestión de nuevos prospectos',
      path: '/leads',
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
      icon: <Users className="w-6 h-6" />,
      roles: ['admin', 'owner', 'supply', 'supply_admin', 'afiliados']
    },
    {
      title: 'Requerimientos',
      description: 'Seguimiento de objetivos y métricas',
      path: '/requerimientos',
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      icon: <Shield className="w-6 h-6" />,
      roles: ['admin', 'owner', 'supply', 'supply_admin']
    },
    {
      title: 'Instalación GPS',
      description: 'Registra instalaciones para clientes y custodios',
      path: '/instalacion-gps',
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
      icon: <Car className="w-6 h-6" />,
      roles: ['admin', 'owner', 'supply', 'supply_admin']
    },
    {
      title: 'Atención al Afiliado',
      description: 'Centro de atención y consultas',
      path: '/support',
      color: 'text-orange-500',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      icon: <LifeBuoy className="w-6 h-6" />,
      roles: ['admin', 'owner', 'atención_afiliado']
    },
    {
      title: 'Administración',
      description: 'Configuración del sistema y usuarios',
      path: '/admin-config',
      color: 'text-gray-500',
      bgColor: 'bg-gray-50 dark:bg-gray-800/30',
      icon: <Settings className="w-6 h-6" />,
      roles: ['admin', 'owner']
    },
    {
      title: 'Call Center',
      description: 'Gestión de llamadas y seguimiento',
      path: '/call-center',
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-50 dark:bg-cyan-900/20',
      icon: <HelpCircle className="w-6 h-6" />,
      roles: ['admin', 'owner', 'atención_afiliado']
    },
    {
      title: 'Agenda',
      description: 'Calendario de instalaciones y eventos',
      path: '/instalaciones-agendadas',
      color: 'text-rose-500',
      bgColor: 'bg-rose-50 dark:bg-rose-900/20',
      icon: <CalendarCheck className="w-6 h-6" />,
      roles: ['admin', 'owner', 'supply', 'supply_admin']
    },
    {
      title: 'Performance',
      description: 'Métricas y análisis de desempeño',
      path: '/performance',
      color: 'text-amber-500',
      bgColor: 'bg-amber-50 dark:bg-amber-900/20',
      icon: <ArrowUpRight className="w-6 h-6" />,
      roles: ['admin', 'owner']
    }
  ];

  // Filter menu items based on user role
  const filteredMenuItems = currentUser
    ? menuItems.filter(item => item.roles.includes(currentUser.role))
    : [];

  const handleCardClick = (path: string) => {
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-7xl mx-auto space-y-12"
        >
          {/* Header Section */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-center space-y-5"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm px-4 py-1.5 rounded-full border border-slate-200/50 dark:border-slate-700/50 shadow-sm"
            >
              <Home className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Inicio
              </span>
            </motion.div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight bg-gradient-to-r from-gray-900 via-gray-800 to-gray-600 dark:from-gray-100 dark:via-gray-200 dark:to-gray-400 bg-clip-text text-transparent">
              CustodiosCRM
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Accede a todas las herramientas para gestionar custodios y afiliados de manera eficiente
            </p>
          </motion.div>

          {/* Features Grid */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredMenuItems.map((item, index) => (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 * index }}
                whileHover={{ 
                  scale: 1.02, 
                  transition: { duration: 0.2 } 
                }}
                className="group h-full"
                onClick={() => handleCardClick(item.path)}
              >
                <Card 
                  className="h-full border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-800/50 backdrop-blur-sm overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 rounded-2xl"
                >
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="flex flex-col h-full space-y-4">
                      <div className={`p-3 w-fit rounded-xl ${item.bgColor} ${item.color} shadow-sm ring-1 ring-slate-200/50 dark:ring-slate-700/50`}>
                        {item.icon}
                      </div>
                      
                      <div className="mt-2 flex-grow">
                        <h3 className={`text-xl font-semibold text-slate-900 dark:text-slate-100 group-hover:${item.color} transition-colors flex items-center gap-2`}>
                          {item.title}
                          <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </h3>
                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
          
          {/* Empty state for users without permissions */}
          {filteredMenuItems.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center p-8 mt-12 text-center"
            >
              <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                <Shield className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-medium text-slate-900 dark:text-slate-100 mb-2">
                Sin acceso a módulos
              </h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-md">
                No tienes permisos para acceder a ningún módulo del sistema. Contacta con el administrador para solicitar acceso.
              </p>
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default Index;
