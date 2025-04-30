
// If this file doesn't exist, we'll create it with the necessary types

// Driver behavior filters
export interface DriverBehaviorFilters {
  selectedClient?: string;
  selectedClients?: string[];
  selectedGroups?: string[];
  [key: string]: any;
}

// Driver group details
export interface DriverGroupDetails {
  id: string;
  name: string;
  client: string;
  description?: string;
  driver_ids: string[];
  created_at?: string;
  updated_at?: string;
}

// Driver for group selection
export interface DriverForGroup {
  id: string;
  name: string;
  score?: number;
  client: string;
}

// Main driver behavior data structure
export interface DriverBehaviorData {
  driverScores: DriverScore[];
  summaryMetrics: {
    averageScore: number;
    totalDrivers: number;
    totalDistance: number;
    totalTrips: number;
    highRiskDrivers: number;
    mediumRiskDrivers: number;
    lowRiskDrivers: number;
  };
  driverPerformance: {
    topDrivers: DriverScore[];
    worstDrivers: DriverScore[];
  };
  riskAssessment: {
    riskDistribution: {
      highRisk: number;
      mediumRisk: number;
      lowRisk: number;
    };
    riskByClient: {
      client: string;
      highRisk: number;
      mediumRisk: number;
      lowRisk: number;
    }[];
  };
  co2Emissions: {
    totalEmissions: number;
    emissionsByClient: {
      client: string;
      emissions: number;
    }[];
    emissionsTrend: {
      date: string;
      emissions: number;
    }[];
  };
}

// Driver score structure
export interface DriverScore {
  id: string | number;
  driver_name: string;
  client: string;
  driver_group: string;
  score: number;
  penalty_points: number;
  trips_count: number;
  duration_text?: string;
  distance_text?: string;
  start_date: string;
  end_date: string;
  distance?: number;
  duration_interval?: any;
}

// Productivity data
export interface DriverProductivityData {
  productivityScores: ProductivityScore[];
  summaryMetrics: {
    averageProductivity: number;
    totalDistance: number;
    totalDuration: string;
    fuelCost: number;
    fuelUsage: number;
  };
  topPerformers: ProductivityScore[];
  underperformers: ProductivityScore[];
}

// Productivity score
export interface ProductivityScore {
  id: string | number;
  driver_name: string;
  client: string;
  driver_group: string;
  productivity_score: number;
  start_date: string;
  end_date: string;
  days_count: number;
  trips_count: number;
  distance: number;
  actual_daily_distance: number;
  expected_daily_distance: number;
  expected_daily_time_minutes: number;
  fuel_cost_per_liter: number;
  expected_fuel_efficiency: number;
  estimated_fuel_usage_liters: number;
  estimated_fuel_cost: number;
}
