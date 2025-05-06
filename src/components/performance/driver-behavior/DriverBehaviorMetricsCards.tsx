import React from 'react';
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { DriverBehaviorData, DriverBehaviorMetricsCardsProps } from "../types/driver-behavior.types";
import { AlertTriangle, Award, Gauge, TrendingDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

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
    <Card className="border shadow-md bg-white/95 hover:shadow-lg transition-all duration-200">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className={`${colorClass} p-3 rounded-xl`}>
            <Icon className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            <div className="flex items-baseline gap-2 mt-1.5">
              <h3 className="text-2xl font-semibold">
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

export function DriverBehaviorMetricsCards({ 
  data, 
  comparisonData,
  isLoading,
  dateRange,
  comparisonRange,
  filters
}: DriverBehaviorMetricsCardsProps) {
  // Ensure we're working with valid data from driver_behavior_scores
  const driverScores = data?.driverScores || [];
  
  // Log what we're getting for debugging
  console.log(`DriverBehaviorMetricsCards: Processing ${driverScores.length} driver records`);
  
  // Calculate average score from all driver records in the period
  const avgScore = driverScores.length > 0
    ? driverScores.reduce((sum, driver) => sum + Number(driver.score || 0), 0) / driverScores.length
    : 0;
    
  // Calculate total penalty points from all driver records in the period
  const totalPenaltyPoints = driverScores.reduce(
    (sum, driver) => sum + Number(driver.penalty_points || 0), 
    0
  );
  
  // Calculate total trips from all driver records in the period
  const totalTrips = driverScores.reduce(
    (sum, driver) => sum + Number(driver.trips_count || 0), 
    0
  );
  
  // Count drivers with critical scores (below 40) in the period
  const criticalDriversCount = driverScores.filter(d => Number(d.score) < 40).length;
  
  // For comparison metrics, use the same calculations on comparison data
  const prevDriverScores = comparisonData?.driverScores || [];
  
  const prevAvgScore = prevDriverScores.length > 0
    ? prevDriverScores.reduce((sum, driver) => sum + Number(driver.score || 0), 0) / prevDriverScores.length
    : 0;
    
  const prevPenaltyPoints = prevDriverScores.reduce(
    (sum, driver) => sum + Number(driver.penalty_points || 0), 
    0
  );
    
  const prevTrips = prevDriverScores.reduce(
    (sum, driver) => sum + Number(driver.trips_count || 0), 
    0
  );
    
  const prevCriticalDrivers = prevDriverScores.filter(d => Number(d.score) < 40).length;
    
  // Calculate percentage changes only when comparison data exists
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
  
  // Debug information
  if (!isLoading) {
    console.log('Metrics calculated:', {
      avgScore: avgScore.toFixed(1),
      totalPenaltyPoints,
      totalTrips,
      criticalDriversCount,
      hasComparison: prevDriverScores.length > 0
    });
  }

  // Animation variants for the cards
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };
  
  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={item}>
        <MetricCard
          title="Puntuación Promedio"
          value={isLoading ? 0 : avgScore.toFixed(1)}
          icon={Gauge}
          colorClass="bg-blue-50 text-blue-600"
          change={Math.round(scoreChange)}
          changeDirection={scoreChange > 0 ? 'up' : scoreChange < 0 ? 'down' : 'neutral'}
          isLoading={isLoading}
        />
      </motion.div>
      
      <motion.div variants={item}>
        <MetricCard
          title="Puntos de Penalización"
          value={isLoading ? 0 : totalPenaltyPoints}
          icon={TrendingDown}
          colorClass="bg-amber-50 text-amber-600"
          change={Math.round(penaltyChange)}
          changeDirection={penaltyChange < 0 ? 'up' : penaltyChange > 0 ? 'down' : 'neutral'}
          isLoading={isLoading}
        />
      </motion.div>
      
      <motion.div variants={item}>
        <MetricCard
          title="Total de Viajes"
          value={isLoading ? 0 : totalTrips}
          icon={Award}
          colorClass="bg-emerald-50 text-emerald-600"
          change={Math.round(tripsChange)}
          changeDirection={tripsChange > 0 ? 'up' : tripsChange < 0 ? 'down' : 'neutral'}
          isLoading={isLoading}
        />
      </motion.div>
      
      <motion.div variants={item}>
        <MetricCard
          title="Conductores Críticos"
          value={isLoading ? 0 : criticalDriversCount}
          icon={AlertTriangle}
          colorClass="bg-red-50 text-red-600"
          change={Math.round(criticalChange)}
          changeDirection={criticalChange < 0 ? 'up' : criticalChange > 0 ? 'down' : 'neutral'}
          isLoading={isLoading}
        />
      </motion.div>
    </motion.div>
  );
}
