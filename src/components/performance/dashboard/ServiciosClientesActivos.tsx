
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
import { getValidNumberOrZero } from '../services/servicios/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ServiciosClientesActivosProps {
  clientes: ClienteServicios[];
  isLoading: boolean;
}

// Define the trend type to ensure type safety
type TrendType = 'up' | 'down' | 'neutral';

export function ServiciosClientesActivos({ clientes = [], isLoading }: ServiciosClientesActivosProps) {
  // Process client data to:
  // 1. Filter out services with estado "Cancelado" when calculating total services
  // 2. Process km average and cost average values properly
  // 3. Add trend indicators for km and cost metrics
  const clientesProcessed = clientes.map(cliente => {
    // Get valid averages or zero if NaN - prioritize km_teorico over km_recorridos
    const kmPromedio = getValidNumberOrZero(cliente.kmPromedio);
    // Round to 2 decimal places for display
    const kmPromedioFormatted = Number(kmPromedio.toFixed(2));
    
    // Get valid cost average (AOV) or zero if NaN
    const costoPromedio = getValidNumberOrZero(cliente.costoPromedio);
    
    // Simple trend calculation (for illustrative purposes)
    // In a real scenario, you would compare with historical data from previous periods
    const kmTrend: TrendType = kmPromedio > 0 ? (kmPromedio > 100 ? 'up' : 'down') : 'neutral';
    const costTrend: TrendType = costoPromedio > 0 ? (costoPromedio > 2000 ? 'up' : 'down') : 'neutral';
    
    return {
      ...cliente,
      // Count only non-cancelled services
      totalServicios: cliente.totalServicios || 0, // This value now comes pre-filtered from the database
      kmPromedio: kmPromedioFormatted,
      costoPromedio: costoPromedio, // This represents AOV (Average Order Value)
      kmTrend,
      costTrend
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
                  <TableCell className="text-right">{formatNumber(cliente.totalServicios)}</TableCell>
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
