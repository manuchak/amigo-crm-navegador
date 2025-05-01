
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
  averageScore: number;
  totalDrivers: number;
}

export interface RiskAssessment {
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
  totalDrivers: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface DriverBehaviorData {
  driverScores: DriverScore[];
  driverPerformance: DriverPerformance;
  riskAssessment: RiskAssessment;
  metrics: {
    avgScore: string;
    totalPenaltyPoints: number;
    totalTrips: number;
    criticalDriversCount: number;
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
