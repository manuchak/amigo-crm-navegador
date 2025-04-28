
import React from 'react';
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { DriverBehaviorData } from "../types/driver-behavior.types";
import { AlertTriangle, Award, Gauge, TrendingDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  colorClass: string;
  change?: number;
  changeDirection?: 'up' | 'down' | 'neutral';
  isLoading?: boolean;
}

function MetricCard({ 
  title, 
  value, 
  icon: Icon, 
  colorClass, 
  change, 
  changeDirection = 'neutral',
  isLoading = false
}: MetricCardProps) {
  return (
    <Card className="border-0 shadow-md bg-white/90">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className={`${colorClass} p-3 rounded-xl`}>
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-semibold mt-1">
                {isLoading ? <Skeleton className="h-8 w-16" /> : value}
              </h3>
              {change !== undefined && !isLoading && (
                <span 
                  className={`text-xs font-medium ${
                    changeDirection === 'up' ? 'text-green-600' : 
                    changeDirection === 'down' ? 'text-red-600' : 'text-gray-600'
                  }`}
                >
                  {changeDirection === 'up' ? '+' : changeDirection === 'down' ? '-' : ''}
                  {Math.abs(change)}%
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface DriverBehaviorMetricsCardsProps {
  data?: DriverBehaviorData | null;
  comparisonData?: DriverBehaviorData | null;
  isLoading: boolean;
}

export function DriverBehaviorMetricsCards({ 
  data, 
  comparisonData,
  isLoading 
}: DriverBehaviorMetricsCardsProps) {
  // Calculate metrics
  const avgScore = data ? data.averageScore : 0;
  const totalPenaltyPoints = data ? data.totalPenaltyPoints : 0;
  const totalTrips = data ? data.totalTrips : 0;
    
  const criticalDriversCount = data && data.driverScores && data.driverScores.length > 0
    ? data.driverScores.filter(d => d.score < 40).length
    : 0;
    
  // Calculate comparison metrics if available
  const prevAvgScore = comparisonData ? comparisonData.averageScore : 0;
  const prevPenaltyPoints = comparisonData ? comparisonData.totalPenaltyPoints : 0;
  const prevTrips = comparisonData ? comparisonData.totalTrips : 0;
    
  const prevCriticalDrivers = comparisonData && comparisonData.driverScores && comparisonData.driverScores.length > 0
    ? comparisonData.driverScores.filter(d => d.score < 40).length
    : 0;
    
  // Calculate percentage changes
  const scoreChange = prevAvgScore > 0 
    ? ((avgScore - prevAvgScore) / prevAvgScore) * 100
    : 0;
    
  const penaltyChange = prevPenaltyPoints > 0
    ? ((totalPenaltyPoints - prevPenaltyPoints) / prevPenaltyPoints) * 100
    : 0;
    
  const tripsChange = prevTrips > 0
    ? ((totalTrips - prevTrips) / prevTrips) * 100
    : 0;
    
  const criticalChange = prevCriticalDrivers > 0
    ? ((criticalDriversCount - prevCriticalDrivers) / prevCriticalDrivers) * 100
    : 0;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      <MetricCard
        title="Puntuación Promedio"
        value={avgScore.toFixed(1)}
        icon={Gauge}
        colorClass="bg-blue-50 text-blue-600"
        change={Math.round(scoreChange)}
        changeDirection={scoreChange > 0 ? 'up' : scoreChange < 0 ? 'down' : 'neutral'}
        isLoading={isLoading}
      />
      
      <MetricCard
        title="Puntos de Penalización"
        value={totalPenaltyPoints}
        icon={TrendingDown}
        colorClass="bg-amber-50 text-amber-600"
        change={Math.round(penaltyChange)}
        changeDirection={penaltyChange < 0 ? 'up' : penaltyChange > 0 ? 'down' : 'neutral'}
        isLoading={isLoading}
      />
      
      <MetricCard
        title="Total de Viajes"
        value={totalTrips}
        icon={Award}
        colorClass="bg-emerald-50 text-emerald-600"
        change={Math.round(tripsChange)}
        changeDirection={tripsChange > 0 ? 'up' : tripsChange < 0 ? 'down' : 'neutral'}
        isLoading={isLoading}
      />
      
      <MetricCard
        title="Conductores Críticos"
        value={criticalDriversCount}
        icon={AlertTriangle}
        colorClass="bg-red-50 text-red-600"
        change={Math.round(criticalChange)}
        changeDirection={criticalChange < 0 ? 'up' : criticalChange > 0 ? 'down' : 'neutral'}
        isLoading={isLoading}
      />
    </div>
  );
}
