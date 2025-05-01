
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { DateRange } from "react-day-picker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { Star, Users } from 'lucide-react';
import { DriverBehaviorFilters } from '../../types/driver-behavior.types';
import { fetchProductivityAnalysis } from '../../services/productivity/productivityService';

interface GroupProductivityCardProps {
  dateRange: DateRange;
  filters?: DriverBehaviorFilters;
}

export function GroupProductivityCard({ dateRange, filters }: GroupProductivityCardProps) {
  const { data: analysisData, isLoading } = useQuery({
    queryKey: ['group-productivity-analysis', dateRange, filters],
    queryFn: () => fetchProductivityAnalysis(dateRange, filters),
    enabled: !!dateRange.from && !!dateRange.to,
  });

  const groupAnalysisData = React.useMemo(() => {
    if (!analysisData) return [];

    // Group data by driver_group
    const groupMap = new Map();
    
    analysisData.forEach(driver => {
      if (!driver.driver_group) return;
      
      const group = driver.driver_group;
      if (!groupMap.has(group)) {
        groupMap.set(group, {
          name: group,
          drivers: [],
          distanceEfficiencySum: 0,
          timeEfficiencySum: 0,
          fuelEfficiencySum: 0,
          ratingSum: 0,
          driversCount: 0,
          validDistanceCount: 0,
          validTimeCount: 0,
          validFuelCount: 0,
        });
      }
      
      const groupData = groupMap.get(group);
      groupData.drivers.push(driver);
      groupData.driversCount++;
      
      // Calculate efficiencies for each driver
      if (driver.expected_daily_distance && driver.distance && driver.days_count) {
        const expectedDistance = driver.expected_daily_distance * driver.days_count;
        const distanceEfficiency = (driver.distance / expectedDistance) * 100;
        groupData.distanceEfficiencySum += distanceEfficiency;
        groupData.validDistanceCount++;
      }
      
      if (driver.expected_daily_time_minutes && driver.duration_interval) {
        // Parse duration interval
        const durationParts = driver.duration_interval.match(/(\d+):(\d+):(\d+)/);
        if (durationParts) {
          const hours = parseInt(durationParts[1]);
          const minutes = parseInt(durationParts[2]);
          const totalMinutes = hours * 60 + minutes;
          
          const expectedMinutes = driver.expected_daily_time_minutes * driver.days_count;
          const timeEfficiency = (totalMinutes / expectedMinutes) * 100;
          groupData.timeEfficiencySum += timeEfficiency;
          groupData.validTimeCount++;
        }
      }
      
      if (driver.expected_fuel_efficiency && driver.estimated_fuel_usage_liters && driver.distance) {
        const actualEfficiency = driver.distance / driver.estimated_fuel_usage_liters;
        const fuelEfficiency = (actualEfficiency / driver.expected_fuel_efficiency) * 100;
        groupData.fuelEfficiencySum += fuelEfficiency;
        groupData.validFuelCount++;
      }
      
      if (driver.productivity_score) {
        groupData.ratingSum += driver.productivity_score;
      }
    });
    
    // Calculate averages and prepare chart data
    return Array.from(groupMap.values())
      .map(group => {
        const avgDistanceEfficiency = group.validDistanceCount > 0 ? 
          group.distanceEfficiencySum / group.validDistanceCount : 0;
          
        const avgTimeEfficiency = group.validTimeCount > 0 ? 
          group.timeEfficiencySum / group.validTimeCount : 0;
          
        const avgFuelEfficiency = group.validFuelCount > 0 ? 
          group.fuelEfficiencySum / group.validFuelCount : 0;
        
        // Score is based on a weighted average of all factors
        let overallScore = 0;
        let weightSum = 0;
        
        if (group.validDistanceCount > 0) {
          overallScore += Math.min(120, avgDistanceEfficiency) * 0.3;
          weightSum += 0.3;
        }
        
        if (group.validTimeCount > 0) {
          // For time, efficiency closest to 100% is best (not going over or under)
          const timeEffScore = Math.max(0, 100 - Math.abs(avgTimeEfficiency - 100));
          overallScore += timeEffScore * 0.3;
          weightSum += 0.3;
        }
        
        if (group.validFuelCount > 0) {
          overallScore += Math.min(120, avgFuelEfficiency) * 0.4;
          weightSum += 0.4;
        }
        
        // Normalize if we have any weights
        const normalizedScore = weightSum > 0 ? overallScore / weightSum : 0;
        
        // Convert normalized score to 5-star rating
        const starsRating = Math.max(1, Math.min(5, Math.round(normalizedScore / 20)));
        
        return {
          name: group.name,
          driversCount: group.driversCount,
          distanceEfficiency: Math.round(avgDistanceEfficiency),
          timeEfficiency: Math.round(avgTimeEfficiency),
          fuelEfficiency: Math.round(avgFuelEfficiency),
          rating: Math.round(normalizedScore),
          starsRating
        };
      })
      .sort((a, b) => b.rating - a.rating);
  }, [analysisData]);

  if (isLoading) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Productividad por Grupo</CardTitle>
        </CardHeader>
        <CardContent className="pt-2 min-h-[300px]">
          <Skeleton className="h-[300px] w-full rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  if (!groupAnalysisData || groupAnalysisData.length === 0) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Productividad por Grupo</CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <Users className="h-12 w-12 mb-4 text-gray-300" />
            <p>No hay datos suficientes para analizar grupos</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border shadow-lg rounded-md">
          <p className="font-semibold">{data.name}</p>
          <p className="text-sm flex items-center mt-1">
            <span className="text-gray-600 mr-1">Calificación:</span> 
            <span className="font-medium">{data.rating}/100</span>
          </p>
          <div className="flex mt-1">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`h-3.5 w-3.5 ${i < data.starsRating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} 
              />
            ))}
          </div>
          <div className="mt-2">
            <p className="text-xs">
              <span className="text-gray-600">Conductores:</span> {data.driversCount}
            </p>
            <p className="text-xs">
              <span className="text-gray-600">Efic. Distancia:</span> {data.distanceEfficiency}%
            </p>
            <p className="text-xs">
              <span className="text-gray-600">Efic. Tiempo:</span> {data.timeEfficiency}%
            </p>
            <p className="text-xs">
              <span className="text-gray-600">Efic. Combustible:</span> {data.fuelEfficiency}%
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          Productividad por Grupo
          <span className="text-sm font-normal text-gray-500">
            ({groupAnalysisData.length} grupos)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="space-y-6">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={groupAnalysisData}
                margin={{ top: 20, right: 30, left: 20, bottom: 65 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end"
                  interval={0}
                  height={70}
                />
                <YAxis 
                  domain={[0, 100]} 
                  tickCount={6}
                  label={{ 
                    value: 'Calificación', 
                    angle: -90, 
                    position: 'insideLeft', 
                    style: { textAnchor: 'middle' } 
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="rating" fill="#16a34a" name="Calificación" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {groupAnalysisData.map((group) => (
              <Card key={group.name} className="overflow-hidden shadow-sm">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium truncate" title={group.name}>{group.name}</h4>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-3.5 w-3.5 ${i < group.starsRating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} 
                        />
                      ))}
                    </div>
                  </div>
                  <div className="mt-2 flex items-baseline">
                    <span className="text-lg font-semibold">{group.rating}</span>
                    <span className="text-xs text-gray-500 ml-1">/100</span>
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <div className="text-gray-500">Distancia</div>
                      <div className="font-medium">{group.distanceEfficiency}%</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Tiempo</div>
                      <div className="font-medium">{group.timeEfficiency}%</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Combustible</div>
                      <div className="font-medium">{group.fuelEfficiency}%</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
