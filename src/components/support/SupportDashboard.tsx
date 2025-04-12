
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSupport } from '@/context/SupportContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Clock, CheckCircle, AlertCircle, BarChart2 } from 'lucide-react';

const SupportDashboard = () => {
  const { tickets, ticketMetrics } = useSupport();
  
  // Format time in hours and minutes
  const formatTime = (seconds: number) => {
    if (seconds === 0) return 'N/A';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours === 0) {
      return `${minutes} minutos`;
    } else if (minutes === 0) {
      return `${hours} horas`;
    }
    
    return `${hours} horas, ${minutes} minutos`;
  };
  
  // Calculate tickets by status for the chart
  const statusData = [
    { name: 'Abiertos', count: tickets.filter(t => t.status === 'open').length },
    { name: 'En Progreso', count: tickets.filter(t => t.status === 'in_progress').length },
    { name: 'Pendientes', count: tickets.filter(t => t.status === 'pending').length },
    { name: 'Resueltos', count: tickets.filter(t => t.status === 'resolved').length },
    { name: 'Cerrados', count: tickets.filter(t => t.status === 'closed').length },
  ];
  
  // Calculate tickets by priority for the chart
  const priorityData = [
    { name: 'Bajo', count: tickets.filter(t => t.priority === 'low').length },
    { name: 'Medio', count: tickets.filter(t => t.priority === 'medium').length },
    { name: 'Alto', count: tickets.filter(t => t.priority === 'high').length },
    { name: 'Urgente', count: tickets.filter(t => t.priority === 'urgent').length },
  ];
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Dashboard de Soporte</h2>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Tickets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <BarChart2 className="h-4 w-4 text-muted-foreground mr-2" />
              <div className="text-2xl font-bold">{ticketMetrics.total}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tickets Abiertos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <AlertCircle className="h-4 w-4 text-orange-500 mr-2" />
              <div className="text-2xl font-bold">{ticketMetrics.open}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tiempo Medio de Resolución
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-blue-500 mr-2" />
              <div className="text-2xl font-bold">{formatTime(ticketMetrics.avgResolutionTime)}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tasa de Resolución
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              <div className="text-2xl font-bold">
                {ticketMetrics.total > 0 
                  ? `${Math.round((ticketMetrics.resolved / ticketMetrics.total) * 100)}%` 
                  : 'N/A'}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tickets por Estado</CardTitle>
            <CardDescription>Distribución del total de tickets por su estado actual</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Tickets por Prioridad</CardTitle>
            <CardDescription>Distribución del total de tickets por nivel de prioridad</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SupportDashboard;
