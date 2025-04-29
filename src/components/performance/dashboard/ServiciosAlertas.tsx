
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { ClienteAlerta } from '../services/servicios';
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
import { getValidNumberOrZero } from '../services/servicios/utils';

interface ServiciosAlertasProps {
  alertas: ClienteAlerta[];
  isLoading: boolean;
}

export function ServiciosAlertas({ alertas = [], isLoading }: ServiciosAlertasProps) {
  const [expandido, setExpandido] = useState(false);
  
  // Process alert data to handle NaN values
  const alertasProcesadas = alertas.map(alerta => ({
    ...alerta,
    kmPromedio: getValidNumberOrZero(alerta.kmPromedio),
    costoPromedio: getValidNumberOrZero(alerta.costoPromedio)
  }));
  
  // Si está cargando o no hay alertas, mostrar estados apropiados
  if (isLoading) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
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

  if (alertasProcesadas.length === 0) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
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
  const alertasVisibles = expandido ? alertasProcesadas : alertasProcesadas.slice(0, 3);
  
  return (
    <Card className="border-0 shadow-sm overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
          Alertas de Servicio ({alertasProcesadas.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-medium text-xs">Cliente</TableHead>
                <TableHead className="text-right font-medium text-xs">Servicios Actual</TableHead>
                <TableHead className="text-right font-medium text-xs">Anterior</TableHead>
                <TableHead className="text-right font-medium text-xs">Variación</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {alertasVisibles.map((alerta, index) => (
                <TableRow key={index} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{alerta.nombre}</TableCell>
                  <TableCell className="text-right">{formatNumber(alerta.servicios_actual)}</TableCell>
                  <TableCell className="text-right">{formatNumber(alerta.servicios_anterior)}</TableCell>
                  <TableCell className="text-right font-medium text-red-600">
                    +{alerta.variacion.toFixed(1)}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {alertasProcesadas.length > 3 && (
          <div className="mt-4 text-center">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setExpandido(!expandido)}
              className="text-xs hover:bg-gray-100"
            >
              {expandido ? (
                <>
                  Ver menos <ChevronUp className="h-3 w-3 ml-1" />
                </>
              ) : (
                <>
                  Ver {alertasProcesadas.length - 3} más <ChevronDown className="h-3 w-3 ml-1" />
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
