
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
}

// Props for driver behavior chart
export interface DriverBehaviorChartProps {
  dateRange: DateRange;
  filters: DriverBehaviorFilters;
}

// Props for CO2 emissions card
export interface CO2EmissionsCardProps {
  dateRange: DateRange;
  filters: DriverBehaviorFilters;
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
}

// Props for driver risk assessment
export interface DriverRiskAssessmentProps {
  dateRange: DateRange;
  filters: DriverBehaviorFilters;
}

// Date range with comparison period
export interface DateRangeWithComparison {
  primary: DateRange;
  comparison?: DateRange;
}
