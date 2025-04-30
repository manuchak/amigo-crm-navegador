
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DateRange } from 'react-day-picker';
import { fetchProductivityAnalysis } from '../../services/productivity/productivityService';
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
import { DriverBehaviorFilters } from '../../types/driver-behavior.types';
import { ProductivityAnalysis } from '../../types/productivity.types';

interface ProductivityAnalysisTableProps {
  dateRange: DateRange;
  filters?: DriverBehaviorFilters;
}

export function ProductivityAnalysisTable({ dateRange, filters }: ProductivityAnalysisTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Fetch analysis data
  const { data: analysisData, isLoading } = useQuery({
    queryKey: ['productivity-analysis', dateRange, filters],
    queryFn: () => fetchProductivityAnalysis(dateRange, filters),
    enabled: !!dateRange.from && !!dateRange.to,
  });
  
  // Filter data by search term
  const filteredData = React.useMemo(() => {
    if (!analysisData) return [];
    
    return analysisData.filter(item => 
      item.driver_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.driver_group.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.client.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [analysisData, searchTerm]);
  
  // Format interval to readable time
  const formatInterval = (interval: string | null): string => {
    if (!interval) return 'N/A';
    
    // Interval is in PostgreSQL format like 02:30:00
    const matches = interval.match(/(\d+):(\d+):(\d+)/);
    if (matches) {
      const hours = parseInt(matches[1]);
      const minutes = parseInt(matches[2]);
      return `${hours}h ${minutes}m`;
    }
    
    return interval;
  };
  
  // Get score color based on productivity score
  const getScoreColor = (score: number | null): string => {
    if (score === null) return 'bg-gray-200 text-gray-800';
    
    if (score >= 100) return 'bg-green-100 text-green-800';
    if (score >= 85) return 'bg-emerald-100 text-emerald-800';
    if (score >= 70) return 'bg-amber-100 text-amber-800';
    return 'bg-red-100 text-red-800';
  };
  
  if (isLoading) {
    return (
      <div>
        <div className="mb-4">
          <Input
            placeholder="Buscar conductor, grupo o cliente..."
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
                <TableHead>Distancia</TableHead>
                <TableHead>Tiempo</TableHead>
                <TableHead>Costo Combustible</TableHead>
                <TableHead>Días</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  {[...Array(8)].map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      <div className="mb-4">
        <Input
          placeholder="Buscar conductor, grupo o cliente..."
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
              <TableHead>Distancia</TableHead>
              <TableHead>Tiempo</TableHead>
              <TableHead>Costo Combustible</TableHead>
              <TableHead>Días</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  No hay datos disponibles para el período seleccionado
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.driver_name}</TableCell>
                  <TableCell>{row.driver_group}</TableCell>
                  <TableCell>{row.client}</TableCell>
                  <TableCell>
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getScoreColor(row.productivity_score)}`}>
                      {row.productivity_score ? row.productivity_score.toFixed(1) : 'N/A'}
                    </div>
                  </TableCell>
                  <TableCell>{row.distance.toLocaleString()} km</TableCell>
                  <TableCell>{formatInterval(row.duration_interval)}</TableCell>
                  <TableCell>${row.estimated_fuel_cost?.toFixed(2) || '0.00'}</TableCell>
                  <TableCell>{row.days_count}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
