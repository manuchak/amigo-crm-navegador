
import { DateRange } from 'react-day-picker';

export interface DriverScore {
  id: number;
  driver_name: string;
  driver_group: string;
  client: string;
  score: number;
  penalty_points: number;
  trips_count: number;
  distance: number;
  distance_text?: string;
  duration_interval?: string;
  duration_text?: string;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
}

export interface DriverPerformance {
  topDrivers: DriverScore[];
  bottomDrivers: DriverScore[];
  needsImprovement: DriverScore[];
  ecoDrivers: DriverScore[];
  averageScore: number;
  totalDrivers: number;
}

export interface RiskAssessment {
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
  totalDrivers: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  level: 'low' | 'moderate' | 'high' | 'critical';
  score: number;
  description: string;
  recommendations: string[];
}

export interface DriverBehaviorData {
  metrics: {
    label: string;
    value: number;
  }[];
  driverScores: DriverScore[];
  driverPerformance: DriverPerformance;
  riskAssessment: RiskAssessment;
  scoreDistribution: {
    excellent: number;
    good: number;
    fair: number;
    poor: number;
    critical: number;
  };
  averageScore: number;
  totalPenaltyPoints: number;
  totalTrips: number;
  totalDrivingTime: number;
  totalDistance: number;
  co2Emissions: {
    totalEmissions: number;
    emissionsByClient: Array<{
      client: string;
      emissions: number;
    }>;
    emissionsTrend: Array<{
      date: string;
      emissions: number;
    }>;
  };
}

export interface DriverBehaviorFilters {
  selectedClient?: string;
  selectedClients?: string[];
  selectedGroup?: string;
  selectedGroups?: string[];
  selectedGroupObject?: any;
  driverIds?: string[];
}

export interface ProductivityMetrics {
  totalDrivers: number;
  highPerformers: number;
  lowPerformers: number;
  averageProductivityScore: number;
  totalDistanceCovered: number;
  totalFuelCost: number;
  totalTimeSpent: string;
}

export interface ScoreCalculationResult {
  score: number;
  penaltyPoints: number;
  scoreCategory: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  colorClass: string;
}

// Driver Group Types
export interface DriverGroupDetails {
  id: number | string;
  name: string;
  description?: string;
  client: string;
  driver_ids?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface DriverForGroup {
  id: string;
  name: string;
  client: string;
  isSelected?: boolean;
}

// Productivity Parameter Types
export interface ProductivityParameter {
  id: number;
  client: string;
  driver_group: string | null;
  expected_daily_distance: number;
  expected_daily_time_minutes: number;
  fuel_cost_per_liter: number;
  expected_fuel_efficiency: number;
  created_at: string;
  updated_at: string;
}

export interface NewProductivityParameter {
  client: string;
  driver_group?: string | null;
  expected_daily_distance: number;
  expected_daily_time_minutes: number;
  fuel_cost_per_liter: number;
  expected_fuel_efficiency: number;
}
