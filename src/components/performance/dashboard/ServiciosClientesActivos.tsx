
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { ClienteServicios } from '../services/servicios';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatNumber, formatCurrency } from '../utils/formatters';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ServiciosClientesActivosProps {
  clientes: ClienteServicios[];
  isLoading: boolean;
}

// Define the trend type to ensure type safety
type TrendType = 'up' | 'down' | 'neutral';

export function ServiciosClientesActivos({ clientes = [], isLoading }: ServiciosClientesActivosProps) {
  // Process client data to ensure all values are valid and log for debugging
  const clientesProcessed = clientes.map(cliente => {
    // Log the raw AOV value
    console.log(`Processing client ${cliente.nombre_cliente} - Raw AOV: ${cliente.costoPromedio}`);
    
    // Use provided trend values or set defaults based on metrics
    const serviciosTrend = cliente.serviciosTrend || 
      (cliente.totalServicios > 50 ? 'up' : (cliente.totalServicios > 20 ? 'neutral' : 'down'));
    
    const kmTrend = cliente.kmTrend || 
      (cliente.kmPromedio > 200 ? 'up' : (cliente.kmPromedio > 100 ? 'neutral' : 'down'));
    
    const costTrend = cliente.costTrend || 
      (cliente.costoPromedio > 5000 ? 'up' : (cliente.costoPromedio > 1000 ? 'neutral' : 'down'));
    
    return {
      ...cliente,
      totalServicios: cliente.totalServicios || 0, 
      kmPromedio: cliente.kmPromedio || 0,
      costoPromedio: cliente.costoPromedio || 0, 
      kmTrend,
      costTrend,
      serviciosTrend
    };
  });
  
  // Sort clients by number of services (descending)
  const clientesOrdenados = [...clientesProcessed]
    .sort((a, b) => b.totalServicios - a.totalServicios)
    .slice(0, 5);
  
  // Render trend icon based on trend direction
  const renderTrendIcon = (trend: TrendType) => {
    switch(trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-amber-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };
  
  // Log final sorted clients for debugging
  console.log("Final processed clients for display:", clientesOrdenados.map(c => ({
    name: c.nombre_cliente,
    servicios: c.totalServicios,
    km: c.kmPromedio,
    aov: c.costoPromedio
  })));
  
  if (isLoading) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium flex items-center">
            <Users className="h-5 w-5 mr-2 text-blue-500" />
            Clientes Más Activos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="h-4 w-full bg-gray-100 rounded animate-pulse"></div>
            <div className="h-4 w-full bg-gray-100 rounded animate-pulse"></div>
            <div className="h-4 w-full bg-gray-100 rounded animate-pulse"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (clientesOrdenados.length === 0) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium flex items-center">
            <Users className="h-5 w-5 mr-2 text-blue-500" />
            Clientes Más Activos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            No hay datos de clientes disponibles
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium flex items-center">
          <Users className="h-5 w-5 mr-2 text-blue-500" />
          Clientes Más Activos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-medium text-xs">Cliente</TableHead>
                <TableHead className="text-right font-medium text-xs">Total Servicios</TableHead>
                <TableHead className="text-right font-medium text-xs">Km Promedio</TableHead>
                <TableHead className="text-right font-medium text-xs">AOV</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientesOrdenados.map((cliente, index) => (
                <TableRow key={index} className="hover:bg-gray-50">
                  <TableCell className="font-medium">
                    {cliente.nombre_cliente || `Cliente ${index + 1}`}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {formatNumber(cliente.totalServicios)}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span>{renderTrendIcon(cliente.serviciosTrend as TrendType)}</span>
                          </TooltipTrigger>
                          <TooltipContent>
                            {cliente.serviciosTrend === 'up' ? 'Alto volumen' : 
                             cliente.serviciosTrend === 'down' ? 'Bajo volumen' : 'Volumen medio'}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {formatNumber(cliente.kmPromedio)}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span>{renderTrendIcon(cliente.kmTrend as TrendType)}</span>
                          </TooltipTrigger>
                          <TooltipContent>
                            {cliente.kmTrend === 'up' ? 'Incrementando' : 
                             cliente.kmTrend === 'down' ? 'Disminuyendo' : 'Sin cambios'}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {formatCurrency(cliente.costoPromedio)}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span>{renderTrendIcon(cliente.costTrend as TrendType)}</span>
                          </TooltipTrigger>
                          <TooltipContent>
                            {cliente.costTrend === 'up' ? 'Incrementando' : 
                             cliente.costTrend === 'down' ? 'Disminuyendo' : 'Sin cambios'}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
