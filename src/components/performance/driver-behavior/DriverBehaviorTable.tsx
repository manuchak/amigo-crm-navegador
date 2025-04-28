
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DateRange } from 'react-day-picker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchDriverBehaviorData } from '../services/driverBehavior/driverBehaviorService';
import { getScoreColorClass, calculateScoreCategory } from '../utils/scoreCalculator';
import { DriverBehaviorData, DriverBehaviorFilters } from '../types/driver-behavior.types';

interface DriverBehaviorTableProps {
  dateRange: DateRange;
  filters?: DriverBehaviorFilters;
}

export function DriverBehaviorTable({ dateRange, filters }: DriverBehaviorTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data, isLoading } = useQuery<DriverBehaviorData | null>({
    queryKey: ['driver-behavior-data', dateRange, filters],
    queryFn: () => fetchDriverBehaviorData(dateRange, filters),
  });
  
  // Filter the data based on search term
  const filteredData = React.useMemo(() => {
    if (!data?.driverScores || !Array.isArray(data.driverScores)) return [];
    
    return data.driverScores.filter(row => 
      row.driver_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.driver_group.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.client.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  if (isLoading) {
    return (
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-medium">Detalle de Comportamiento de Conducción</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Buscar por conductor o grupo..."
              disabled
              className="max-w-sm"
            />
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Conductor</TableHead>
                  <TableHead>Grupo</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Puntuación</TableHead>
                  <TableHead>Puntos de Penalización</TableHead>
                  <TableHead>Viajes</TableHead>
                  <TableHead>Tiempo</TableHead>
                  <TableHead>Distancia</TableHead>
                  <TableHead>Período</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    {[...Array(9)].map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <CardTitle className="text-lg font-medium">Detalle de Comportamiento de Conducción</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Input
            placeholder="Buscar por conductor o grupo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Conductor</TableHead>
                <TableHead>Grupo</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Puntuación</TableHead>
                <TableHead>Puntos de Penalización</TableHead>
                <TableHead>Viajes</TableHead>
                <TableHead>Tiempo</TableHead>
                <TableHead>Distancia</TableHead>
                <TableHead>Período</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    No hay datos disponibles para el período seleccionado
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((row) => {
                  const scoreCategory = calculateScoreCategory(row.score);
                  const colorClass = getScoreColorClass(row.score);
                  
                  const startDate = new Date(row.start_date).toLocaleDateString();
                  const endDate = new Date(row.end_date).toLocaleDateString();
                  
                  return (
                    <TableRow key={row.id}>
                      <TableCell>{row.driver_name}</TableCell>
                      <TableCell>{row.driver_group}</TableCell>
                      <TableCell>{row.client}</TableCell>
                      <TableCell>
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
                          {row.score.toFixed(1)}
                        </div>
                      </TableCell>
                      <TableCell>{row.penalty_points}</TableCell>
                      <TableCell>{row.trips_count}</TableCell>
                      <TableCell>{row.duration_text || "N/A"}</TableCell>
                      <TableCell>{row.distance_text || "N/A"}</TableCell>
                      <TableCell>
                        {startDate} - {endDate}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
