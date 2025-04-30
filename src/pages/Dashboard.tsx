
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PieChart, Pie, ResponsiveContainer, Cell, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

// Define the ClientData interface to avoid type errors
interface ClientData {
  id: number;
  nombre: string;
  empresa: string;
  etapa: string;
  valor: number;
  fechaCreacion: string;
}

// Import mock data
// This import was likely causing an issue, so defining mockClients inline
const mockClients: ClientData[] = [
  { id: 1, nombre: "Juan Pérez", empresa: "Seguridad Total", etapa: "Prospecto", valor: 5000, fechaCreacion: "2025-03-25" },
  { id: 2, nombre: "María López", empresa: "Custodios Armados", etapa: "Contactado", valor: 7500, fechaCreacion: "2025-03-27" },
  { id: 3, nombre: "Carlos Ruiz", empresa: "Protección Ejecutiva", etapa: "Negociación", valor: 12000, fechaCreacion: "2025-03-28" },
  { id: 4, nombre: "Ana Martínez", empresa: "Seguridad Privada", etapa: "Ganado", valor: 20000, fechaCreacion: "2025-04-01" },
  { id: 5, nombre: "Roberto Sánchez", empresa: "Guardias Express", etapa: "Perdido", valor: 3000, fechaCreacion: "2025-04-05" },
  { id: 6, nombre: "Daniela Torres", empresa: "Custodios Elite", etapa: "Prospecto", valor: 8000, fechaCreacion: "2025-04-10" },
  { id: 7, nombre: "Miguel Álvarez", empresa: "Protección Total", etapa: "Ganado", valor: 15000, fechaCreacion: "2025-04-12" },
  { id: 8, nombre: "Sofía Ramírez", empresa: "Guardias Premium", etapa: "Negociación", valor: 10000, fechaCreacion: "2025-04-15" },
  { id: 9, nombre: "Javier Morales", empresa: "Seguridad Express", etapa: "Contactado", valor: 6500, fechaCreacion: "2025-04-18" },
  { id: 10, nombre: "Lucía Castillo", empresa: "Custodios 24/7", etapa: "Prospecto", valor: 9000, fechaCreacion: "2025-04-20" }
];

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Count clients per stage
  const stageData = [
    { name: "Prospecto", value: mockClients.filter(c => c.etapa === 'Prospecto').length, color: '#3b82f6' },
    { name: "Contactado", value: mockClients.filter(c => c.etapa === 'Contactado').length, color: '#6366f1' },
    { name: "Negociación", value: mockClients.filter(c => c.etapa === 'Negociación').length, color: '#f59e0b' },
    { name: "Ganado", value: mockClients.filter(c => c.etapa === 'Ganado').length, color: '#10b981' },
    { name: "Perdido", value: mockClients.filter(c => c.etapa === 'Perdido').length, color: '#f43f5e' }
  ];
  
  // Calculate value per stage
  const valueData = [
    { 
      name: 'Prospecto', 
      value: mockClients.filter(c => c.etapa === 'Prospecto').reduce((sum, c) => sum + c.valor, 0),
      color: '#3b82f6' 
    },
    { 
      name: 'Contactado', 
      value: mockClients.filter(c => c.etapa === 'Contactado').reduce((sum, c) => sum + c.valor, 0),
      color: '#6366f1' 
    },
    { 
      name: 'Negociación', 
      value: mockClients.filter(c => c.etapa === 'Negociación').reduce((sum, c) => sum + c.valor, 0),
      color: '#f59e0b' 
    },
    { 
      name: 'Ganado', 
      value: mockClients.filter(c => c.etapa === 'Ganado').reduce((sum, c) => sum + c.valor, 0),
      color: '#10b981' 
    },
    { 
      name: 'Perdido', 
      value: mockClients.filter(c => c.etapa === 'Perdido').reduce((sum, c) => sum + c.valor, 0),
      color: '#f43f5e' 
    }
  ];
  
  // Calculate total value and clients
  const totalClients = mockClients.length;
  const totalValue = mockClients.reduce((sum, client) => sum + client.valor, 0);
  const activeValue = mockClients
    .filter(c => c.etapa !== 'Perdido')
    .reduce((sum, client) => sum + client.valor, 0);
  
  // Get recently added clients
  const recentClients = [...mockClients]
    .sort((a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime())
    .slice(0, 5);

  return (
    <div className="container mx-auto py-24 px-4 animate-fade-in">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="glass animate-scale-in">
          <CardHeader className="pb-2">
            <CardDescription>Total de Clientes</CardDescription>
            <CardTitle className="text-3xl">{totalClients}</CardTitle>
          </CardHeader>
        </Card>
        
        <Card className="glass animate-scale-in animate-delay-100">
          <CardHeader className="pb-2">
            <CardDescription>Clientes Ganados</CardDescription>
            <CardTitle className="text-3xl">{mockClients.filter(c => c.etapa === 'Ganado').length}</CardTitle>
          </CardHeader>
        </Card>
        
        <Card className="glass animate-scale-in animate-delay-200">
          <CardHeader className="pb-2">
            <CardDescription>Valor Total (€)</CardDescription>
            <CardTitle className="text-3xl">{totalValue.toLocaleString('es-ES')}</CardTitle>
          </CardHeader>
        </Card>
        
        <Card className="glass animate-scale-in animate-delay-300">
          <CardHeader className="pb-2">
            <CardDescription>Valor Activo (€)</CardDescription>
            <CardTitle className="text-3xl">{activeValue.toLocaleString('es-ES')}</CardTitle>
          </CardHeader>
        </Card>
      </div>
      
      <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="clients">Por Clientes</TabsTrigger>
          <TabsTrigger value="values">Por Valor</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass">
              <CardHeader>
                <CardTitle>Distribución de Clientes</CardTitle>
                <CardDescription>Cantidad de clientes por etapa</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stageData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        innerRadius={60}
                        fill="#8884d8"
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {stageData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass">
              <CardHeader>
                <CardTitle>Clientes Recientes</CardTitle>
                <CardDescription>Últimos 5 clientes añadidos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentClients.map((client) => (
                    <div key={client.id} className="border-b pb-2 last:border-0">
                      <div className="flex justify-between">
                        <div className="font-medium">{client.nombre}</div>
                        <div className="text-sm text-muted-foreground">{client.empresa}</div>
                      </div>
                      <div className="flex justify-between text-sm mt-1">
                        <div className="text-muted-foreground">
                          {new Date(client.fechaCreacion).toLocaleDateString('es-ES')}
                        </div>
                        <div>€{client.valor.toLocaleString('es-ES')}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="clients">
          <Card className="glass">
            <CardHeader>
              <CardTitle>Clientes por Etapa</CardTitle>
              <CardDescription>Distribución detallada</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stageData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" name="Clientes">
                      {stageData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="values">
          <Card className="glass">
            <CardHeader>
              <CardTitle>Valor por Etapa</CardTitle>
              <CardDescription>Valor total de clientes por etapa</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={valueData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`€${value.toLocaleString('es-ES')}`, 'Valor']} />
                    <Bar dataKey="value" name="Valor">
                      {valueData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
