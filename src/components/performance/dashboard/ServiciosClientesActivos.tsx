
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import { ClienteServicios } from '../services/servicios'; // Updated import
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatNumber, formatCurrency } from '../utils/formatters';

interface ServiciosClientesActivosProps {
  clientes: ClienteServicios[];
  isLoading: boolean;
}

export function ServiciosClientesActivos({ clientes = [], isLoading }: ServiciosClientesActivosProps) {
  // Ordenar clientes por número de servicios (descendente)
  const clientesOrdenados = [...clientes].sort((a, b) => b.totalServicios - a.totalServicios).slice(0, 5);
  
  if (isLoading) {
    return (
      <Card className="border-0 shadow-md">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
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
      <Card className="border-0 shadow-md">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
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
    <Card className="border-0 shadow-md">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
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
                <TableHead>Cliente</TableHead>
                <TableHead className="text-right">Total Servicios</TableHead>
                <TableHead className="text-right">Km Promedio</TableHead>
                <TableHead className="text-right">Costo Promedio</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientesOrdenados.map((cliente, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{cliente.nombre_cliente || `Cliente ${index + 1}`}</TableCell>
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
