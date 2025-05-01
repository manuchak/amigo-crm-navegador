
// Productivity parameter for client/driver groups
export interface ProductivityParameter {
  id: number;
  client: string;
  driver_group?: string | null;
  expected_daily_distance: number;
  expected_daily_time_minutes: number;
  fuel_cost_per_liter: number;
  expected_fuel_efficiency: number;
  created_at: string;
  updated_at: string;
  user_id?: string;
}

// For creating new parameters
export interface NewProductivityParameter {
  client: string;
  driver_group?: string | null;
  expected_daily_distance: number;
  expected_daily_time_minutes: number;
  fuel_cost_per_liter: number;
  expected_fuel_efficiency: number;
}

// For productivity analysis data
export interface ProductivityAnalysis {
  id: number;
  client: string;
  driver_name: string;
  driver_group: string;
  start_date: string;
  end_date: string;
  distance: number;
  duration_interval: string | null;
  trips_count: number;
  days_count: number;
  productivity_score: number | null;
  expected_daily_distance?: number;
  expected_daily_time_minutes?: number;
  actual_daily_distance?: number;
  fuel_cost_per_liter?: number;
  expected_fuel_efficiency?: number;
  estimated_fuel_usage_liters?: number;
  estimated_fuel_cost?: number;
}

// Productivity summary metrics
export interface ProductivitySummary {
  totalDrivers: number;
  highPerformers: number;
  lowPerformers: number;
  averageProductivityScore: number;
  totalDistanceCovered: number;
  totalFuelCost: number;
  totalTimeSpent: string;
}

// Efficiency metrics
export interface EfficiencyMetrics {
  distanceEfficiency: number;
  timeEfficiency: number;
  fuelEfficiency: number;
  overallRating: number;
  starsRating: number;
  totalDrivers: number;
  driversWithFullData: number;
}

// Driver ratings
export interface DriverRating {
  id: number;
  driverName: string;
  driverGroup: string;
  distanceEfficiency: number;
  timeEfficiency: number;
  fuelEfficiency: number;
  rating: number;
  starsRating: number;
  distance: number;
  duration: string;
  daysActive: number;
}

// Group productivity data
export interface GroupProductivity {
  name: string;
  driversCount: number;
  distanceEfficiency: number;
  timeEfficiency: number;
  fuelEfficiency: number;
  rating: number;
  starsRating: number;
}
