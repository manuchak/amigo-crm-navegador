
export type PerformanceMetric = {
  label: string;
  value: number | string;
  change?: number;
  changeLabel?: string;
  changeType?: 'increase' | 'decrease' | 'neutral';
  description?: string;
};

export type CustodioData = {
  id: string | number;
  name: string;
  activeMonths: number;
  completedJobs: number;
  averageRating: number;
  reliability: number;
  responseTime: number;
  earnings: number;
  ltv: number;
  status: 'active' | 'inactive' | 'pending';
};

export type CustodioPerformanceData = {
  summaryMetrics: PerformanceMetric[];
  performanceByDay: {
    date: string;
    completionRate: number;
    responseTime: number;
    reliability: number;
    quality: number;
    validations: number;
  }[];
  custodios: CustodioData[];
  revenue: {
    totalRevenue: number;
    averageRevenue: number;
    byMonth: { month: string; revenue: number }[];
    byService: { service: string; revenue: number }[];
  };
  retention: {
    retention30Days: number;
    retention60Days: number;
    retention90Days: number;
    churnRate: number;
    retentionByMonth: { month: string; rate: number }[];
  };
  activityMap: {
    locations: { lat: number; lng: number; weight: number }[];
    heatData: any;
  };
};
