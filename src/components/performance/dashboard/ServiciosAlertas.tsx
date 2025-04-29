
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { ClienteAlerta } from '../services/servicios/serviciosDataService';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatNumber, formatCurrency } from '../utils/formatters';

interface ServiciosAlertasProps {
  alertas: ClienteAlerta[];
  isLoading: boolean;
}

export function ServiciosAlertas({ alertas = [], isLoading }: ServiciosAlertasProps) {
  const [expandido, setExpandido] = useState(false);
  
  // Si está cargando o no hay alertas, mostrar estados apropiados
  if (isLoading) {
    return (
      <Card className="border-0 shadow-md">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-medium flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
            Alertas de Servicio
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

  if (alertas.length === 0) {
    return (
      <Card className="border-0 shadow-md">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-medium flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-gray-400" />
            Alertas de Servicio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            No hay alertas activas en este momento
          </div>
        </CardContent>
      </Card>
    );
  }

  // Mostrar solo las primeras 3 alertas a menos que esté expandido
  const alertasVisibles = expandido ? alertas : alertas.slice(0, 3);
  
  return (
    <Card className="border-0 shadow-md overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
          Alertas de Servicio ({alertas.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead className="text-right">Servicios Actual</TableHead>
                <TableHead className="text-right">Servicios Anterior</TableHead>
                <TableHead className="text-right">Variación</TableHead>
                <TableHead className="text-right">Km Promedio</TableHead>
                <TableHead className="text-right">Costo Promedio</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {alertasVisibles.map((alerta, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{alerta.nombre}</TableCell>
                  <TableCell className="text-right">{formatNumber(alerta.servicios_actual)}</TableCell>
                  <TableCell className="text-right">{formatNumber(alerta.servicios_anterior)}</TableCell>
                  <TableCell className="text-right font-medium text-red-600">
                    +{alerta.variacion.toFixed(1)}%
                  </TableCell>
                  <TableCell className="text-right">{formatNumber(alerta.kmPromedio)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(alerta.costoPromedio)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {alertas.length > 3 && (
          <div className="mt-4 text-center">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setExpandido(!expandido)}
            >
              {expandido ? "Ver menos" : `Ver ${alertas.length - 3} más`}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
