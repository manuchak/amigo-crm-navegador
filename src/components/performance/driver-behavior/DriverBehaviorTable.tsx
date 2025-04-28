
import React, { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { DateRange } from "react-day-picker";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DriverBehaviorScore, 
  DriverBehaviorFilters 
} from "../types/driver-behavior.types";
import { fetchDriverBehaviorData } from "../services/driverBehavior/driverBehaviorService";
import { calculateScoreCategory, getScoreColorClass } from "../utils/scoreCalculator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface DriverBehaviorTableProps {
  dateRange: DateRange;
}

export function DriverBehaviorTable({ dateRange }: DriverBehaviorTableProps) {
  const [filters, setFilters] = useState<DriverBehaviorFilters>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [scoreFilter, setScoreFilter] = useState<string>("all");
  
  // Fetch driver behavior data
  const { data, isLoading, error } = useQuery({
    queryKey: ['driver-behavior-data', dateRange, filters],
    queryFn: () => fetchDriverBehaviorData(dateRange, filters),
  });
  
  // Handle search filter
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Debounce implementation would be better in a real application
    setFilters(prev => ({
      ...prev,
      driverName: value
    }));
  };
  
  // Handle score category filter
  const handleScoreFilter = (value: string) => {
    setScoreFilter(value);
    
    let minScore: number | undefined;
    let maxScore: number | undefined;
    
    switch (value) {
      case 'excellent':
        minScore = 90;
        maxScore = 100;
        break;
      case 'good':
        minScore = 75;
        maxScore = 89.99;
        break;
      case 'fair':
        minScore = 60;
        maxScore = 74.99;
        break;
      case 'poor':
        minScore = 40;
        maxScore = 59.99;
        break;
      case 'critical':
        minScore = 0;
        maxScore = 39.99;
        break;
      case 'all':
      default:
        minScore = undefined;
        maxScore = undefined;
    }
    
    setFilters(prev => ({
      ...prev,
      minScore,
      maxScore
    }));
  };
  
  if (error) {
    return (
      <Card className="border-0 shadow-md">
        <CardContent className="p-6">
          <div className="text-center p-4">
            <p className="text-red-500">Error al cargar los datos de comportamiento de conducción</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="border-0 shadow-md">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <CardTitle className="text-lg font-medium">Comportamiento de Conducción</CardTitle>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Input
            placeholder="Buscar por conductor..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full sm:w-64"
          />
          
          <Select
            value={scoreFilter}
            onValueChange={handleScoreFilter}
          >
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filtrar por puntaje" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los puntajes</SelectItem>
              <SelectItem value="excellent">Excelente (90-100)</SelectItem>
              <SelectItem value="good">Bueno (75-89)</SelectItem>
              <SelectItem value="fair">Regular (60-74)</SelectItem>
              <SelectItem value="poor">Bajo (40-59)</SelectItem>
              <SelectItem value="critical">Crítico (0-39)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Conductor</TableHead>
                <TableHead>Grupo</TableHead>
                <TableHead className="text-right">Puntaje</TableHead>
                <TableHead className="text-right">Puntos Penalización</TableHead>
                <TableHead className="text-right">Viajes</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Período</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <TableRow key={i}>
                    {Array(7).fill(0).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : data && data.length > 0 ? (
                data.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{row.driver_name}</TableCell>
                    <TableCell>{row.driver_group}</TableCell>
                    <TableCell className="text-right">
                      <span
                        className={`px-2 py-1 rounded-md text-xs font-medium ${getScoreColorClass(row.score)}`}
                      >
                        {row.score}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">{row.penalty_points}</TableCell>
                    <TableCell className="text-right">{row.trips_count}</TableCell>
                    <TableCell>{row.client}</TableCell>
                    <TableCell>
                      {format(new Date(row.start_date), 'dd MMM', { locale: es })} - 
                      {format(new Date(row.end_date), 'dd MMM yyyy', { locale: es })}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6">
                    No se encontraron datos para el período seleccionado
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
