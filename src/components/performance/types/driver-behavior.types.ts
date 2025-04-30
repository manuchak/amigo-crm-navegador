
import { DateRange } from "react-day-picker";

export interface DriverScore {
  id: number;
  driver_name: string;
  driver_group: string;
  score: number;
  penalty_points: number;
  trips_count: number;
  distance: number;
  distance_text: string;
  duration_text?: string;
  start_date: string;
  end_date: string;
  client: string;
  created_at: string;
  updated_at: string;
}

export interface DriverPerformance {
  topDrivers: DriverScore[];
  needsImprovement: DriverScore[];
  ecoDrivers: DriverScore[];
}

export interface RiskAssessment {
  level: 'low' | 'moderate' | 'high' | 'critical';
  score: number;
  description: string;
  recommendations: string[];
}

export interface ScoreDistribution {
  excellent: number;
  good: number;
  fair: number;
  poor: number;
  critical: number;
}

export interface MetricItem {
  label: string;
  value: number;
}

export interface DriverBehaviorData {
  metrics: MetricItem[];
  driverScores: DriverScore[];
  scoreDistribution: ScoreDistribution;
  averageScore: number;
  totalPenaltyPoints: number;
  totalTrips: number;
  totalDrivingTime: number;
  totalDistance: number;
  co2Emissions: number;
  riskAssessment: RiskAssessment;
  driverPerformance: DriverPerformance;
}

export interface DriverBehaviorFilters {
  selectedClients?: string[];
  selectedClient?: string;
  selectedGroups?: string[];
  dateRange?: DateRange;
}

export interface ScoreCalculationResult {
  score: number;
  penaltyPoints: number;
  scoreCategory: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  colorClass: string;
}

export interface DriverGroup {
  name: string;
  client: string;
  drivers: number;
  avgScore: number;
}

export interface DriverGroupDetails {
  id: string;
  name: string;
  client: string;
  description?: string;
  driver_ids: string[];
  created_at?: string;
  updated_at?: string;
}

export interface DriverForGroup {
  id: string;
  name: string;
  score?: number;
  client: string;
}

export interface DriverGroupsState {
  groups: DriverGroupDetails[];
  filteredGroups: DriverGroupDetails[];
  searchTerm: string;
  loading: boolean;
  error: string | null;
}
