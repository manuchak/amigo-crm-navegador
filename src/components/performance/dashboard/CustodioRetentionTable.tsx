
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface CustodioData {
  id: string | number;
  name: string;
  activeMonths: number;
  completedJobs: number;
  status: 'active' | 'inactive' | 'pending';
}

interface CustodioRetentionTableProps {
  data?: CustodioData[];
  isLoading: boolean;
}

export function CustodioRetentionTable({ data = [], isLoading }: CustodioRetentionTableProps) {
  // Sort by active months
  const sortedData = [...(data || [])].sort((a, b) => b.activeMonths - a.activeMonths);
  
  // Take only top performers (by months active)
  const topCustodios = sortedData.slice(0, 8);
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      case 'inactive': return 'bg-slate-50 text-slate-600 border-slate-200';
      case 'pending': return 'bg-amber-50 text-amber-600 border-amber-200';
      default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };
  
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Activo';
      case 'inactive': return 'Inactivo';
      case 'pending': return 'Pendiente';
      default: return status;
    }
  };
  
  // Simulate last active date based on status and active months
  const getLastActiveDate = (custodio: CustodioData) => {
    const date = new Date();
    
    if (custodio.status === 'active') {
      return 'Hoy';
    } else if (custodio.status === 'inactive') {
      // Simulate last active date - more months inactive for those with lower active months
      date.setMonth(date.getMonth() - Math.floor(Math.random() * 3 + 1));
      return formatDistanceToNow(date, { addSuffix: true, locale: es });
    } else {
      date.setDate(date.getDate() - Math.floor(Math.random() * 7 + 1));
      return formatDistanceToNow(date, { addSuffix: true, locale: es });
    }
  };

  return (
    <Card className="border-0 shadow-md h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">
          Custodios por Tiempo Activo
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2 px-0">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Custodio</TableHead>
                <TableHead className="text-center">Meses Activos</TableHead>
                <TableHead className="text-center">Servicios</TableHead>
                <TableHead className="text-right">Última Actividad</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                // Skeleton rows when loading
                Array(5).fill(0).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                    <TableCell className="text-center"><Skeleton className="h-6 w-12 mx-auto" /></TableCell>
                    <TableCell className="text-center"><Skeleton className="h-6 w-16 mx-auto" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-6 w-20 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : topCustodios.length ? (
                topCustodios.map((custodio) => (
                  <TableRow key={custodio.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <span>{custodio.name}</span>
                        <Badge 
                          variant="outline"
                          className={`ml-2 ${getStatusColor(custodio.status)}`}
                        >
                          {getStatusLabel(custodio.status)}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-semibold">{custodio.activeMonths}</TableCell>
                    <TableCell className="text-center">{custodio.completedJobs}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{getLastActiveDate(custodio)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No hay custodios activos en este período
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
