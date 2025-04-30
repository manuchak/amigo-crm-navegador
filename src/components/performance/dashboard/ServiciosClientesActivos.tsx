
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
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

interface ServiciosClientesActivosProps {
  clientes: ClienteServicios[];
  isLoading: boolean;
}

export function ServiciosClientesActivos({ clientes = [], isLoading }: ServiciosClientesActivosProps) {
  // Process client data to:
  // 1. Filter out services with estado "Cancelado" when calculating total services
  // 2. Process km average and cost average values properly
  const clientesProcessed = clientes.map(cliente => {
    // Get valid averages or zero if NaN
    const kmPromedio = getValidNumberOrZero(cliente.kmPromedio);
    const costoPromedio = getValidNumberOrZero(cliente.costoPromedio);
    
    return {
      ...cliente,
      // Count only non-cancelled services
      totalServicios: cliente.totalServicios || 0, // This value now comes pre-filtered from the database
      kmPromedio: kmPromedio,
      costoPromedio: costoPromedio // This represents AOV (Average Order Value)
    };
  });
  
  // Sort clients by number of services (descending)
  const clientesOrdenados = [...clientesProcessed]
    .sort((a, b) => b.totalServicios - a.totalServicios)
    .slice(0, 5);
  
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
                  <TableCell className="text-right">{formatNumber(cliente.kmPromedio)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(cliente.costoPromedio)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
