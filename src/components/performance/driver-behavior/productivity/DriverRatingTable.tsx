
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DateRange } from 'react-day-picker';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, Search, AlertCircle } from 'lucide-react';
import { DriverBehaviorFilters } from '../../types/driver-behavior.types';
import { fetchProductivityAnalysis } from '../../services/productivity/productivityService';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface DriverRatingTableProps {
  dateRange: DateRange;
  filters?: DriverBehaviorFilters;
}

type SortDirection = 'asc' | 'desc';
type SortField = 'name' | 'group' | 'rating' | 'distance' | 'time' | 'fuel';

export function DriverRatingTable({ dateRange, filters }: DriverRatingTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('rating');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [groupFilter, setGroupFilter] = useState<string>('all');
  
  const { data: analysisData, isLoading, isError } = useQuery({
    queryKey: ['productivity-rating-analysis', dateRange, filters],
    queryFn: () => fetchProductivityAnalysis(dateRange, filters),
    enabled: !!dateRange.from && !!dateRange.to,
  });

  // Get unique groups for filtering
  const uniqueGroups = React.useMemo(() => {
    if (!analysisData) return [];
    
    const groups = new Set<string>();
    analysisData.forEach(driver => {
      if (driver.driver_group) {
        groups.add(driver.driver_group);
      }
    });
    
    return Array.from(groups).sort();
  }, [analysisData]);

  // Process driver data to calculate ratings
  const processedData = React.useMemo(() => {
    if (!analysisData) return [];

    return analysisData.map(driver => {
      // Calculate distance efficiency
      let distanceEfficiency = 0;
      if (driver.expected_daily_distance && driver.distance && driver.days_count) {
        const expectedDistance = driver.expected_daily_distance * driver.days_count;
        distanceEfficiency = (driver.distance / expectedDistance) * 100;
      }

      // Calculate time efficiency
      let timeEfficiency = 0;
      if (driver.expected_daily_time_minutes && driver.duration_interval) {
        // Convert duration_interval string to minutes
        const durationParts = driver.duration_interval.match(/(\d+):(\d+):(\d+)/);
        if (durationParts) {
          const hours = parseInt(durationParts[1]);
          const minutes = parseInt(durationParts[2]);
          const totalMinutes = hours * 60 + minutes;
          
          const expectedMinutes = driver.expected_daily_time_minutes * driver.days_count;
          timeEfficiency = (totalMinutes / expectedMinutes) * 100;
        }
      }

      // Calculate fuel efficiency
      let fuelEfficiency = 0;
      if (driver.expected_fuel_efficiency && driver.estimated_fuel_usage_liters && driver.distance) {
        const actualEfficiency = driver.distance / driver.estimated_fuel_usage_liters;
        fuelEfficiency = (actualEfficiency / driver.expected_fuel_efficiency) * 100;
      }

      // Overall rating is the productivity_score from the database or calculate a fallback
      const rating = driver.productivity_score || Math.min(100, 
        ((distanceEfficiency > 0 ? Math.min(distanceEfficiency, 150) : 0) +
        (timeEfficiency > 0 ? Math.min(200 - timeEfficiency, 150) : 0) +
        (fuelEfficiency > 0 ? Math.min(fuelEfficiency, 150) : 0)) / 3
      );

      // Convert to a 5-star rating
      const starsRating = Math.max(1, Math.min(5, Math.round(rating / 20)));

      return {
        id: driver.id,
        driverName: driver.driver_name,
        driverGroup: driver.driver_group,
        distanceEfficiency,
        timeEfficiency,
        fuelEfficiency,
        rating,
        starsRating,
        distance: driver.distance || 0,
        duration: driver.duration_interval || '00:00:00',
        daysActive: driver.days_count || 0,
      };
    });
  }, [analysisData]);

  // Filter and sort data
  const filteredAndSortedData = React.useMemo(() => {
    if (!processedData) return [];

    // First filter
    let result = processedData.filter(driver => 
      (driver.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
       driver.driverGroup.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (groupFilter === 'all' || driver.driverGroup === groupFilter)
    );

    // Then sort
    result = [...result].sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'name':
          comparison = a.driverName.localeCompare(b.driverName);
          break;
        case 'group':
          comparison = a.driverGroup.localeCompare(b.driverGroup);
          break;
        case 'rating':
          comparison = a.rating - b.rating;
          break;
        case 'distance':
          comparison = a.distanceEfficiency - b.distanceEfficiency;
          break;
        case 'time':
          comparison = a.timeEfficiency - b.timeEfficiency;
          break;
        case 'fuel':
          comparison = a.fuelEfficiency - b.fuelEfficiency;
          break;
        default:
          comparison = a.rating - b.rating;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [processedData, searchTerm, sortField, sortDirection, groupFilter]);

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Format duration from PostgreSQL interval to readable time
  const formatDuration = (interval: string): string => {
    const matches = interval.match(/(\d+):(\d+):(\d+)/);
    if (matches) {
      const hours = parseInt(matches[1]);
      const minutes = parseInt(matches[2]);
      return `${hours}h ${minutes}m`;
    }
    return interval;
  };

  // Get color class based on rating value
  const getRatingColorClass = (rating: number): string => {
    if (rating >= 90) return 'text-green-600';
    if (rating >= 75) return 'text-emerald-600';
    if (rating >= 60) return 'text-amber-600';
    if (rating >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  // Get color class based on efficiency value
  const getEfficiencyColorClass = (efficiency: number, isTimeEfficiency: boolean = false): string => {
    if (isTimeEfficiency) {
      // For time efficiency, lower is better
      if (efficiency <= 90) return 'text-green-600';
      if (efficiency <= 100) return 'text-emerald-600';
      if (efficiency <= 110) return 'text-amber-600';
      if (efficiency <= 130) return 'text-orange-600';
      return 'text-red-600';
    } else {
      // For other efficiencies, higher is better
      if (efficiency >= 110) return 'text-green-600';
      if (efficiency >= 100) return 'text-emerald-600';
      if (efficiency >= 90) return 'text-amber-600';
      if (efficiency >= 70) return 'text-orange-600';
      return 'text-red-600';
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Calificación de Conductores</CardTitle>
        <div className="flex flex-col sm:flex-row gap-4 mt-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por conductor o grupo..."
              className="pl-10 bg-gray-50 border-gray-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-48">
            <Select
              value={groupFilter}
              onValueChange={(value) => setGroupFilter(value)}
            >
              <SelectTrigger className="bg-gray-50 border-gray-200">
                <SelectValue placeholder="Filtrar por grupo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los grupos</SelectItem>
                {uniqueGroups.map(group => (
                  <SelectItem key={group} value={group}>{group}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Error al cargar los datos. Por favor intente nuevamente.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="rounded-lg overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead 
                    className="font-medium cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('name')}
                  >
                    Conductor {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead 
                    className="font-medium cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('group')}
                  >
                    Grupo {sortField === 'group' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead 
                    className="font-medium cursor-pointer hover:bg-gray-100 text-right"
                    onClick={() => handleSort('rating')}
                  >
                    Calificación {sortField === 'rating' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead 
                    className="font-medium cursor-pointer hover:bg-gray-100 text-right"
                    onClick={() => handleSort('distance')}
                  >
                    Efic. Distancia {sortField === 'distance' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead 
                    className="font-medium cursor-pointer hover:bg-gray-100 text-right"
                    onClick={() => handleSort('time')}
                  >
                    Efic. Tiempo {sortField === 'time' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead 
                    className="font-medium cursor-pointer hover:bg-gray-100 text-right"
                    onClick={() => handleSort('fuel')}
                  >
                    Efic. Combustible {sortField === 'fuel' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      {[...Array(6)].map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : filteredAndSortedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No hay datos disponibles o que coincidan con el filtro
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAndSortedData.map((driver) => (
                    <TableRow key={driver.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{driver.driverName}</TableCell>
                      <TableCell>{driver.driverGroup}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end">
                          <span className={`font-semibold mr-2 ${getRatingColorClass(driver.rating)}`}>{driver.rating.toFixed(1)}</span>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`h-3.5 w-3.5 ${i < driver.starsRating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} 
                              />
                            ))}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className={`text-right font-medium ${getEfficiencyColorClass(driver.distanceEfficiency)}`}>
                        {driver.distanceEfficiency > 0 ? `${driver.distanceEfficiency.toFixed(1)}%` : 'N/A'}
                      </TableCell>
                      <TableCell className={`text-right font-medium ${getEfficiencyColorClass(driver.timeEfficiency, true)}`}>
                        {driver.timeEfficiency > 0 ? `${driver.timeEfficiency.toFixed(1)}%` : 'N/A'}
                      </TableCell>
                      <TableCell className={`text-right font-medium ${getEfficiencyColorClass(driver.fuelEfficiency)}`}>
                        {driver.fuelEfficiency > 0 ? `${driver.fuelEfficiency.toFixed(1)}%` : 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
