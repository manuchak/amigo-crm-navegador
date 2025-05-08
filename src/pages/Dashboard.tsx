
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth';
import PageLayout from '@/components/layout/PageLayout';
import { Skeleton } from '@/components/ui/skeleton';

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'Resumen' | 'Por Clientes' | 'Por Valor'>('Resumen');
  const [isLoading, setIsLoading] = useState(true);
  const { currentUser, loading: authLoading } = useAuth();

  // Simulate data loading
  useEffect(() => {
    console.log("Dashboard component mounted");
    
    // Simulate data fetch
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Debug logging
  useEffect(() => {
    console.log("Dashboard auth state:", { 
      user: currentUser?.email, 
      role: currentUser?.role,
      authLoading
    });
  }, [currentUser, authLoading]);

  return (
    <PageLayout title="Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="bg-white rounded-lg shadow-sm">
          <CardContent className="p-6">
            <div className="text-sm text-slate-500 mb-2">Total de Clientes</div>
            {isLoading ? (
              <Skeleton className="h-10 w-20" />
            ) : (
              <div className="text-4xl font-bold">10</div>
            )}
          </CardContent>
        </Card>
        
        <Card className="bg-white rounded-lg shadow-sm">
          <CardContent className="p-6">
            <div className="text-sm text-slate-500 mb-2">Clientes Ganados</div>
            {isLoading ? (
              <Skeleton className="h-10 w-20" />
            ) : (
              <div className="text-4xl font-bold">2</div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="bg-white rounded-lg shadow-sm">
          <CardContent className="p-6">
            <div className="text-sm text-slate-500 mb-2">Valor Total (€)</div>
            {isLoading ? (
              <Skeleton className="h-10 w-32" />
            ) : (
              <div className="text-4xl font-bold">96.000</div>
            )}
          </CardContent>
        </Card>
        
        <Card className="bg-white rounded-lg shadow-sm">
          <CardContent className="p-6">
            <div className="text-sm text-slate-500 mb-2">Valor Activo (€)</div>
            {isLoading ? (
              <Skeleton className="h-10 w-32" />
            ) : (
              <div className="text-4xl font-bold">93.000</div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Card className="bg-white rounded-lg shadow-sm">
        <CardContent className="p-6">
          <div className="flex justify-center mb-4">
            <div className="inline-flex rounded-md bg-gray-100 p-1">
              <Button 
                variant={activeTab === 'Resumen' ? 'default' : 'ghost'} 
                className={activeTab === 'Resumen' ? "px-4 py-2 rounded-md bg-white shadow-sm text-sm font-medium" : "px-4 py-2 rounded-md text-sm font-medium text-slate-600"}
                onClick={() => setActiveTab('Resumen')}
              >
                Resumen
              </Button>
              <Button 
                variant={activeTab === 'Por Clientes' ? 'default' : 'ghost'} 
                className={activeTab === 'Por Clientes' ? "px-4 py-2 rounded-md bg-white shadow-sm text-sm font-medium" : "px-4 py-2 rounded-md text-sm font-medium text-slate-600"}
                onClick={() => setActiveTab('Por Clientes')}
              >
                Por Clientes
              </Button>
              <Button 
                variant={activeTab === 'Por Valor' ? 'default' : 'ghost'} 
                className={activeTab === 'Por Valor' ? "px-4 py-2 rounded-md bg-white shadow-sm text-sm font-medium" : "px-4 py-2 rounded-md text-sm font-medium text-slate-600"}
                onClick={() => setActiveTab('Por Valor')}
              >
                Por Valor
              </Button>
            </div>
          </div>
          
          <h2 className="text-xl font-semibold text-center mb-1">Distribución de Clientes</h2>
          <p className="text-center text-slate-500 text-sm mb-6">Cantidad de clientes por etapa</p>
          
          <div className="h-64 flex items-center justify-center">
            {isLoading ? (
              <div className="w-full space-y-2">
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-4 w-3/4 mx-auto" />
              </div>
            ) : (
              <div className="text-sm text-slate-400">Gráfico de distribución aquí</div>
            )}
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  );
};

export default Dashboard;
