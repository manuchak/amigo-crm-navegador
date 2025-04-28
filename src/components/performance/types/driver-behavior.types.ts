export interface DriverBehaviorScore {
  id: number;
  driver_name: string;
  driver_group: string;
  score: number;
  penalty_points: number;
  trips_count: number;
  duration_interval?: string;
  duration_text?: string;
  distance?: number;
  distance_text?: string;
  start_date: string;
  end_date: string;
  client: string;
  created_at: string;
  updated_at: string;
}

export interface ScoreCalculationResult {
  score: number;
  penaltyPoints: number;
  scoreCategory: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  colorClass: string;
}

export interface DriverBehaviorFilters {
  driverName?: string;
  driverGroup?: string;
  client?: string;
  startDate?: Date;
  endDate?: Date;
  minScore?: number;
  maxScore?: number;
}

export interface DriverBehaviorMetric {
  label: string;
  value: number | string;
}

export interface ScoreDistribution {
  excellent: number;
  good: number;
  fair: number;
  poor: number;
  critical: number;
}

export interface DriverBehaviorData {
  metrics: DriverBehaviorMetric[];
  driverScores: DriverBehaviorScore[];
  scoreDistribution?: ScoreDistribution;
  averageScore: number;
  totalPenaltyPoints: number;
  totalTrips: number;
}
