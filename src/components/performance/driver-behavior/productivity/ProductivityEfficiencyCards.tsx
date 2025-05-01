
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  BarChart, 
  TrendingUp, 
  TrendingDown, 
  Fuel, 
  Timer, 
  Star 
} from "lucide-react";
import { DateRange } from "react-day-picker";
import { DriverBehaviorFilters } from '../../types/driver-behavior.types';
import { fetchProductivityAnalysis } from '../../services/productivity/productivityService';

interface ProductivityEfficiencyCardsProps {
  dateRange: DateRange;
  filters?: DriverBehaviorFilters;
}

export function ProductivityEfficiencyCards({ dateRange, filters }: ProductivityEfficiencyCardsProps) {
  const { data: analysisData, isLoading } = useQuery({
    queryKey: ['productivity-efficiency-analysis', dateRange, filters],
    queryFn: () => fetchProductivityAnalysis(dateRange, filters),
    enabled: !!dateRange.from && !!dateRange.to,
  });

  const calculateEfficiencyMetrics = React.useMemo(() => {
    if (!analysisData || analysisData.length === 0) return null;

    const activeDrivers = analysisData.filter(driver => driver.trips_count > 0);
    if (activeDrivers.length === 0) return null;

    // Calculate distance efficiency (actual vs expected)
    let totalDistanceEfficiency = 0;
    let driversWithDistanceData = 0;

    // Calculate time efficiency (actual vs expected)
    let totalTimeEfficiency = 0;
    let driversWithTimeData = 0;

    // Calculate fuel efficiency
    let totalFuelEfficiency = 0;
    let driversWithFuelData = 0;

    // Calculate overall rating
    let totalRating = 0;
    let driversWithFullData = 0;

    activeDrivers.forEach(driver => {
      // Distance efficiency
      if (driver.expected_daily_distance && driver.distance && driver.days_count) {
        const expectedDistance = driver.expected_daily_distance * driver.days_count;
        const distanceEfficiency = (driver.distance / expectedDistance) * 100;
        totalDistanceEfficiency += distanceEfficiency;
        driversWithDistanceData++;
      }

      // Time efficiency
      if (driver.expected_daily_time_minutes && driver.duration_interval) {
        // Convert duration_interval string to minutes
        const durationParts = driver.duration_interval.match(/(\d+):(\d+):(\d+)/);
        if (durationParts) {
          const hours = parseInt(durationParts[1]);
          const minutes = parseInt(durationParts[2]);
          const totalMinutes = hours * 60 + minutes;
          
          const expectedMinutes = driver.expected_daily_time_minutes * driver.days_count;
          const timeEfficiency = (totalMinutes / expectedMinutes) * 100;
          totalTimeEfficiency += timeEfficiency;
          driversWithTimeData++;
        }
      }

      // Fuel efficiency
      if (driver.expected_fuel_efficiency && driver.estimated_fuel_usage_liters && driver.distance) {
        const actualEfficiency = driver.distance / driver.estimated_fuel_usage_liters;
        const fuelEfficiency = (actualEfficiency / driver.expected_fuel_efficiency) * 100;
        totalFuelEfficiency += fuelEfficiency;
        driversWithFuelData++;
      }

      // Overall rating calculation
      if (driver.productivity_score) {
        totalRating += driver.productivity_score;
        driversWithFullData++;
      }
    });

    const avgDistanceEfficiency = driversWithDistanceData > 0 ? 
      totalDistanceEfficiency / driversWithDistanceData : 0;
    
    const avgTimeEfficiency = driversWithTimeData > 0 ? 
      totalTimeEfficiency / driversWithTimeData : 0;
    
    const avgFuelEfficiency = driversWithFuelData > 0 ? 
      totalFuelEfficiency / driversWithFuelData : 0;

    const avgRating = driversWithFullData > 0 ? 
      totalRating / driversWithFullData : 0;

    const starsRating = Math.max(1, Math.min(5, Math.round(avgRating / 20)));

    return {
      distanceEfficiency: avgDistanceEfficiency,
      timeEfficiency: avgTimeEfficiency,
      fuelEfficiency: avgFuelEfficiency,
      overallRating: avgRating,
      starsRating,
      totalDrivers: activeDrivers.length,
      driversWithFullData
    };
  }, [analysisData]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="shadow-sm">
            <CardHeader className="pb-2">
              <Skeleton className="h-5 w-32 mb-1" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20 mb-2" />
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!calculateEfficiencyMetrics) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Eficiencia</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-400">
              No hay datos suficientes para calcular métricas de eficiencia
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const metrics = calculateEfficiencyMetrics;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-gray-500">Eficiencia Distancia</CardTitle>
            <BarChart className="h-4 w-4 text-gray-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold">
              {metrics.distanceEfficiency ? metrics.distanceEfficiency.toFixed(1) : 'N/A'}%
            </span>
            {metrics.distanceEfficiency > 100 ? (
              <span className="text-green-500 text-xs flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                {(metrics.distanceEfficiency - 100).toFixed(1)}% más km
              </span>
            ) : metrics.distanceEfficiency < 100 && metrics.distanceEfficiency > 0 ? (
              <span className="text-amber-500 text-xs flex items-center">
                <TrendingDown className="h-3 w-3 mr-1" />
                {(100 - metrics.distanceEfficiency).toFixed(1)}% menos km
              </span>
            ) : null}
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Comparado con la distancia diaria esperada
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-gray-500">Eficiencia Tiempo</CardTitle>
            <Timer className="h-4 w-4 text-gray-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold">
              {metrics.timeEfficiency ? metrics.timeEfficiency.toFixed(1) : 'N/A'}%
            </span>
            {metrics.timeEfficiency > 100 ? (
              <span className="text-amber-500 text-xs flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                {(metrics.timeEfficiency - 100).toFixed(1)}% más tiempo
              </span>
            ) : metrics.timeEfficiency < 100 && metrics.timeEfficiency > 0 ? (
              <span className="text-green-500 text-xs flex items-center">
                <TrendingDown className="h-3 w-3 mr-1" />
                {(100 - metrics.timeEfficiency).toFixed(1)}% menos tiempo
              </span>
            ) : null}
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Comparado con el tiempo diario esperado
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-gray-500">Eficiencia Combustible</CardTitle>
            <Fuel className="h-4 w-4 text-gray-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold">
              {metrics.fuelEfficiency ? metrics.fuelEfficiency.toFixed(1) : 'N/A'}%
            </span>
            {metrics.fuelEfficiency > 100 ? (
              <span className="text-green-500 text-xs flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                {(metrics.fuelEfficiency - 100).toFixed(1)}% mejor rendimiento
              </span>
            ) : metrics.fuelEfficiency < 100 && metrics.fuelEfficiency > 0 ? (
              <span className="text-amber-500 text-xs flex items-center">
                <TrendingDown className="h-3 w-3 mr-1" />
                {(100 - metrics.fuelEfficiency).toFixed(1)}% peor rendimiento
              </span>
            ) : null}
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Comparado con el rendimiento esperado
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-gray-500">Calificación General</CardTitle>
            <Star className="h-4 w-4 text-amber-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline">
            <span className="text-2xl font-bold">
              {metrics.overallRating.toFixed(1)}
            </span>
            <span className="text-xs text-gray-500 ml-2">/ 100</span>
          </div>
          <div className="flex items-center mt-1">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`h-4 w-4 ${i < metrics.starsRating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} 
              />
            ))}
            <span className="text-xs text-gray-400 ml-2">
              {metrics.driversWithFullData} conductores
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
