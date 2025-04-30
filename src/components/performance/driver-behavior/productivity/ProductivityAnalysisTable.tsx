
import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProductivityAnalysis } from "../../types/productivity.types";
import { formatCurrency } from '@/components/performance/utils/formatters';

interface ProductivityAnalysisTableProps {
  data: ProductivityAnalysis[];
  isLoading: boolean;
}

export function ProductivityAnalysisTable({ data, isLoading }: ProductivityAnalysisTableProps) {
  if (isLoading) {
    return (
      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-medium">Análisis de Productividad</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-[200px]">
          <div className="animate-pulse flex space-x-4">
            <div className="h-4 w-4 bg-primary/20 rounded-full"></div>
            <div className="h-4 w-4 bg-primary/40 rounded-full"></div>
            <div className="h-4 w-4 bg-primary/60 rounded-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const sortedData = [...data].sort((a, b) => {
    // First sort by productivity score (higher first)
    if ((b.productivity_score || 0) - (a.productivity_score || 0) !== 0) {
      return (b.productivity_score || 0) - (a.productivity_score || 0);
    }
    
    // Then sort by driver name
    return a.driver_name.localeCompare(b.driver_name);
  });
  
  const getProductivityBadge = (score: number | null) => {
    if (score === null) return <Badge variant="outline">Sin datos</Badge>;
    
    if (score >= 100) {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Alto rendimiento</Badge>;
    } else if (score >= 80) {
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Buen rendimiento</Badge>;
    } else {
      return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">Bajo rendimiento</Badge>;
    }
  };
  
  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-medium">Análisis de Productividad</CardTitle>
        <CardDescription>Análisis detallado de productividad por conductor</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No hay datos de productividad disponibles con los filtros aplicados
          </div>
        ) : (
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Conductor</TableHead>
                  <TableHead>Grupo</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="text-right">Productividad</TableHead>
                  <TableHead className="text-right">Distancia/Día</TableHead>
                  <TableHead className="text-right">Tiempo Total</TableHead>
                  <TableHead className="text-right">Comb. Estimado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.driver_name}</TableCell>
                    <TableCell>{item.driver_group}</TableCell>
                    <TableCell>{item.client}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {item.productivity_score !== null ? (
                          <span className="font-medium">
                            {Math.round(item.productivity_score)}%
                          </span>
                        ) : (
                          <span className="text-muted-foreground">N/A</span>
                        )}
                        {getProductivityBadge(item.productivity_score)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {Math.round(item.actual_daily_distance)} km
                      {item.expected_daily_distance && (
                        <div className="text-xs text-muted-foreground">
                          Meta: {item.expected_daily_distance} km
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {item.duration_interval ? (
                        <>
                          {item.duration_interval.split(':')[0]}h {item.duration_interval.split(':')[1]}m
                        </>
                      ) : (
                        "N/A"
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(item.estimated_fuel_cost)}
                      <div className="text-xs text-muted-foreground">
                        {Math.round(item.estimated_fuel_usage_liters)} litros
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
