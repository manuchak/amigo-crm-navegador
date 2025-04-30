
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
  id?: number;
  client: string;
  driver_group?: string | null;
  expected_daily_distance: number;
  expected_daily_time_minutes: number;
  fuel_cost_per_liter: number;
  expected_fuel_efficiency: number;
}

export interface ProductivityAnalysis {
  id: number;
  driver_name: string;
  driver_group: string;
  client: string;
  start_date: string;
  end_date: string;
  distance: number;
  duration_interval: string;
  trips_count: number;
  expected_daily_distance: number | null;
  expected_daily_time_minutes: number | null;
  fuel_cost_per_liter: number | null;
  expected_fuel_efficiency: number | null;
  days_count: number;
  actual_daily_distance: number;
  estimated_fuel_usage_liters: number;
  estimated_fuel_cost: number;
  productivity_score: number | null;
}

export interface ProductivitySummary {
  totalDrivers: number;
  highPerformers: number;
  averagePerformers: number;
  lowPerformers: number;
  averageProductivityScore: number;
  totalDistanceCovered: number;
  totalFuelCost: number;
  totalTimeSpent: string;
}
