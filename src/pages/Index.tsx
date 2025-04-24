
import React from 'react';
import { useAuth } from '@/context/auth/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { LineChart, Shield, Users, LifeBuoy, Car, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

const Index = () => {
  const { currentUser } = useAuth();
  
  // Base menu items that will be filtered based on user role
  const menuItems = [
    {
      title: 'Dashboard',
      description: 'Vista general del rendimiento',
      path: '/dashboard',
      color: 'bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900',
      icon: <LineChart className="w-6 h-6 text-blue-500" />,
      roles: ['admin', 'owner', 'atención_afiliado', 'supply', 'supply_admin', 'afiliados']
    },
    {
      title: 'Leads',
      description: 'Gestión de nuevos prospectos',
      path: '/leads',
      color: 'bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900',
      icon: <Users className="w-6 h-6 text-emerald-500" />,
      roles: ['admin', 'owner', 'supply', 'supply_admin', 'afiliados']
    },
    {
      title: 'Requerimientos',
      description: 'Seguimiento de objetivos y métricas',
      path: '/requerimientos',
      color: 'bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900',
      icon: <Shield className="w-6 h-6 text-purple-500" />,
      roles: ['admin', 'owner', 'supply', 'supply_admin']
    },
    {
      title: 'Instalación GPS',
      description: 'Registra instalaciones para clientes y custodios',
      path: '/instalacion-gps',
      color: 'bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900',
      icon: <Car className="w-6 h-6 text-indigo-500" />,
      roles: ['admin', 'owner', 'supply', 'supply_admin']
    },
    {
      title: 'Atención al Afiliado',
      description: 'Centro de atención y consultas',
      path: '/support',
      color: 'bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900',
      icon: <LifeBuoy className="w-6 h-6 text-orange-500" />,
      roles: ['admin', 'owner', 'atención_afiliado']
    },
    {
      title: 'Administración',
      description: 'Configuración del sistema y usuarios',
      path: '/admin-config',
      color: 'bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900',
      icon: <Settings className="w-6 h-6 text-gray-500" />,
      roles: ['admin', 'owner']
    }
  ];

  // Filter menu items based on user role
  const filteredMenuItems = currentUser
    ? menuItems.filter(item => item.roles.includes(currentUser.role))
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-900">
      <main className="container mx-auto px-6 pt-24 pb-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-5xl mx-auto space-y-10"
        >
          {/* Header Section */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
              CustodiosCRM
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Accede a todas las herramientas para gestionar custodios y afiliados de manera eficiente
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMenuItems.map((item, index) => (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card 
                  className={`group hover:shadow-lg transition-all duration-300 border border-slate-200/50 dark:border-slate-800/50 overflow-hidden ${item.color}`}
                  onClick={() => window.location.href = item.path}
                >
                  <CardContent className="p-6 cursor-pointer">
                    <div className="flex flex-col space-y-4">
                      <div className="p-3 w-fit rounded-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-sm">
                        {item.icon}
                      </div>
                      
                      <div>
                        <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 group-hover:text-slate-700 dark:group-hover:text-white transition-colors">
                          {item.title}
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
