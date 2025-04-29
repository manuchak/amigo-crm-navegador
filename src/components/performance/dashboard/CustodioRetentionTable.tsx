import React, { useMemo } from 'react';
import { DateRange } from "react-day-picker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ServiciosMetricData } from "../services/servicios/serviciosDataService";

interface CustodioRetentionTableProps {
  data: ServiciosMetricData;
  isLoading: boolean;
  dateRange: DateRange;
}

export function CustodioRetentionTable({ data, isLoading, dateRange }: CustodioRetentionTableProps) {
  const custodiosData = useMemo(() => {
    // This is a placeholder. In a real implementation, you would process the data
    // to extract custodio retention information from the servicios data
    return [];
  }, [data]);

  if (isLoading) {
    return (
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle>Retención de Custodios</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="w-full h-[300px]" />
        </CardContent>
      </Card>
    );
  }

  if (custodiosData.length === 0) {
    return (
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle>Retención de Custodios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 text-center text-muted-foreground">
            No hay datos suficientes para mostrar la tabla de retención de custodios.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <CardTitle>Retención de Custodios</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Servicios Completados</TableHead>
                <TableHead>Tasa de Retención</TableHead>
                <TableHead>Última Actividad</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* This would be populated with custodio retention data in a real implementation */}
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No hay datos disponibles
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
