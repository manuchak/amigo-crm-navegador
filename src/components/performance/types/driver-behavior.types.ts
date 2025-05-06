
import { DateRange } from "react-day-picker";

// Driver behavior filters
export interface DriverBehaviorFilters {
  selectedClient?: string;
  selectedGroup?: string;
  selectedGroupObject?: any;
  driverIds?: string[];
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

// Props for metrics cards
export interface DriverBehaviorMetricsCardsProps {
  dateRange: DateRange;
  comparisonRange?: DateRange;
  filters: DriverBehaviorFilters;
  data?: DriverBehaviorData | null;
  comparisonData?: DriverBehaviorData | null;
  isLoading?: boolean;
}

// Props for driver behavior chart
export interface DriverBehaviorChartProps {
  dateRange: DateRange;
  filters: DriverBehaviorFilters;
  data?: DriverScore[] | null;
  isLoading?: boolean;
}

// Props for CO2 emissions card
export interface CO2EmissionsCardProps {
  dateRange: DateRange;
  filters: DriverBehaviorFilters;
  data?: DriverBehaviorData | null;
  isLoading?: boolean;
}

// Props for driver behavior table
export interface DriverBehaviorTableProps {
  dateRange: DateRange;
  filters: DriverBehaviorFilters;
}

// Props for top drivers panel
export interface TopDriversPanelProps {
  dateRange: DateRange;
  filters: DriverBehaviorFilters;
  data?: DriverPerformance;
  isLoading?: boolean;
}

// Props for driver risk assessment
export interface DriverRiskAssessmentProps {
  dateRange: DateRange;
  filters: DriverBehaviorFilters;
  riskData?: RiskAssessment;
  isLoading?: boolean;
}

// Date range with comparison period
export interface DateRangeWithComparison {
  primary: DateRange;
  comparison?: DateRange;
}

// Driver score data structure
export interface DriverScore {
  id: string;
  driver_name: string;
  driver_group: string;
  client: string;
  score: number;
  penalty_points: number;
  trips_count: number;
  start_date: string;
  end_date: string;
  duration_text?: string;
  distance_text?: string;
  distance?: number;
}

// Driver behavior data structure
export interface DriverBehaviorData {
  metrics: Array<{ label: string; value: number }>;
  driverScores: DriverScore[];
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
    emissionsByClient: Array<{ client: string; emissions: number }>;
    emissionsTrend: Array<{ date: string; emissions: number }>;
  };
  riskAssessment: RiskAssessment;
  driverPerformance: DriverPerformance;
}

// Driver performance data
export interface DriverPerformance {
  topDrivers: DriverScore[];
  bottomDrivers: DriverScore[];
  needsImprovement: DriverScore[];
  ecoDrivers: DriverScore[];
  averageScore: number;
  totalDrivers: number;
}

// Risk assessment data
export interface RiskAssessment {
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
  totalDrivers: number;
  riskLevel: string;
  level: 'low' | 'medium' | 'high' | 'critical';
  score: number;
  description: string;
  recommendations: string[];
}

// Score calculation result
export interface ScoreCalculationResult {
  score: number;
  penaltyPoints: number;
  scoreCategory: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  colorClass: string;
}

// Productivity parameters
export interface ProductivityParameter {
  id: string;
  client: string;
  group?: string;
  parameter_name: string;
  parameter_value: number;
  parameter_unit: string;
  created_at?: string;
  updated_at?: string;
  description?: string;
}

// New productivity parameter
export interface NewProductivityParameter {
  client: string;
  group?: string;
  parameter_name: string;
  parameter_value: number;
  parameter_unit: string;
  description?: string;
}

// Props for productivity parameters table
export interface ProductivityParametersTableProps {
  client: string;
  group?: string;
  onEditParameters: () => void;
}

// Props for productivity parameters dialog
export interface ProductivityParametersDialogProps {
  isOpen: boolean;
  onClose: () => void;
  client: string;
  group?: string;
}
