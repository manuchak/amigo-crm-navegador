
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
import { Search } from "lucide-react";

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
  
  return (
    <div>
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar conductor, grupo o cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-50 border-gray-200 focus-visible:ring-gray-200"
          />
        </div>
      </div>
      <div className="rounded-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="font-medium">Conductor</TableHead>
                <TableHead className="font-medium">Grupo</TableHead>
                <TableHead className="font-medium">Cliente</TableHead>
                <TableHead className="font-medium">Puntuación</TableHead>
                <TableHead className="font-medium">Distancia</TableHead>
                <TableHead className="font-medium">Tiempo</TableHead>
                <TableHead className="font-medium">Costo Combustible</TableHead>
                <TableHead className="font-medium">Días</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    {[...Array(8)].map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-gray-500">
                    No hay datos disponibles para el período seleccionado
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((row) => (
                  <TableRow key={row.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{row.driver_name}</TableCell>
                    <TableCell>{row.driver_group}</TableCell>
                    <TableCell>{row.client}</TableCell>
                    <TableCell>
                      <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getScoreColor(row.productivity_score)}`}>
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
    </div>
  );
}
