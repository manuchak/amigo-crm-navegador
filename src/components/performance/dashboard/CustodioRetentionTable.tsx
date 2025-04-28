
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DateRange } from "react-day-picker";
import { format, parseISO, differenceInMonths, differenceInDays, startOfMonth, isWithinInterval } from 'date-fns';
import { es } from 'date-fns/locale';

interface CustodioRetentionTableProps {
  data?: any[];
  isLoading: boolean;
  dateRange: DateRange;
}

export function CustodioRetentionTable({ data = [], isLoading, dateRange }: CustodioRetentionTableProps) {
  const custodioStats = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    // Get all unique custodio names
    const custodioNames = Array.from(new Set(
      data
        .filter(s => s.nombre_custodio)
        .map(s => s.nombre_custodio)
    ));
    
    // Process data for each custodio
    return custodioNames.map(name => {
      // Get all services for this custodio
      const custodioServices = data.filter(s => s.nombre_custodio === name && s.fecha_hora_cita);
      
      // Skip if no services
      if (custodioServices.length === 0) return null;
      
      // Get first and last service dates
      const sortedServices = [...custodioServices].sort((a, b) => 
        new Date(a.fecha_hora_cita).getTime() - new Date(b.fecha_hora_cita).getTime()
      );
      
      const firstServiceDate = parseISO(sortedServices[0].fecha_hora_cita);
      const lastServiceDate = parseISO(sortedServices[sortedServices.length - 1].fecha_hora_cita);
      
      // Calculate months active
      const monthsActive = differenceInMonths(lastServiceDate, firstServiceDate) + 1;
      
      // Calculate lifetime
      const lifetimeDays = differenceInDays(lastServiceDate, firstServiceDate) + 1;
      
      // Calculate services per month
      const servicesPerMonth = monthsActive > 0 ? (custodioServices.length / monthsActive).toFixed(1) : custodioServices.length.toFixed(1);
      
      // Calculate active months (months with at least one service)
      const activeMonths = new Set();
      custodioServices.forEach(service => {
        const serviceDate = parseISO(service.fecha_hora_cita);
        activeMonths.add(format(startOfMonth(serviceDate), 'yyyy-MM'));
      });
      
      // Calculate average earnings per service
      const servicesWithEarnings = custodioServices.filter(s => s.costo_custodio);
      const avgEarnings = servicesWithEarnings.length > 0
        ? servicesWithEarnings.reduce((sum, s) => sum + (s.costo_custodio || 0), 0) / servicesWithEarnings.length
        : 0;
      
      // Check if recently active (active in last 30 days from the end of date range)
      const isRecentlyActive = dateRange.to
        ? custodioServices.some(s => {
            const serviceDate = parseISO(s.fecha_hora_cita);
            return differenceInDays(dateRange.to!, serviceDate) <= 30;
          })
        : false;
      
      return {
        name,
        serviceCount: custodioServices.length,
        firstServiceDate,
        lastServiceDate,
        monthsActive,
        lifetimeDays,
        activeMonthsCount: activeMonths.size,
        servicesPerMonth: Number(servicesPerMonth),
        avgEarnings,
        isRecentlyActive,
        // Calculate retention rate (percentage of months active out of total months in lifetime)
        retentionRate: monthsActive > 0 ? (activeMonths.size / monthsActive * 100).toFixed(0) + '%' : '100%'
      };
    }).filter(Boolean).sort((a, b) => b!.serviceCount - a!.serviceCount);
  }, [data, dateRange]);

  if (isLoading) {
    return (
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-medium">Retención de Custodios</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <CardTitle className="text-lg font-medium">Retención de Custodios</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Custodio</TableHead>
                <TableHead className="text-right">Servicios</TableHead>
                <TableHead className="text-right">Primer Servicio</TableHead>
                <TableHead className="text-right">Último Servicio</TableHead>
                <TableHead className="text-right">Meses de Antigüedad</TableHead>
                <TableHead className="text-right">Meses Activos</TableHead>
                <TableHead className="text-right">Servicios por Mes</TableHead>
                <TableHead className="text-right">Retención</TableHead>
                <TableHead className="text-right">Ingreso Promedio</TableHead>
                <TableHead className="text-right">Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {custodioStats.slice(0, 10).map((stats: any) => (
                <TableRow key={stats.name}>
                  <TableCell className="font-medium">{stats.name}</TableCell>
                  <TableCell className="text-right">{stats.serviceCount}</TableCell>
                  <TableCell className="text-right">{format(stats.firstServiceDate, 'dd/MM/yyyy', { locale: es })}</TableCell>
                  <TableCell className="text-right">{format(stats.lastServiceDate, 'dd/MM/yyyy', { locale: es })}</TableCell>
                  <TableCell className="text-right">{stats.monthsActive}</TableCell>
                  <TableCell className="text-right">{stats.activeMonthsCount}</TableCell>
                  <TableCell className="text-right">{stats.servicesPerMonth}</TableCell>
                  <TableCell className="text-right">{stats.retentionRate}</TableCell>
                  <TableCell className="text-right">${stats.avgEarnings.toFixed(0)}</TableCell>
                  <TableCell className={`text-right font-medium ${stats.isRecentlyActive ? 'text-green-600' : 'text-red-500'}`}>
                    {stats.isRecentlyActive ? 'Activo' : 'Inactivo'}
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
