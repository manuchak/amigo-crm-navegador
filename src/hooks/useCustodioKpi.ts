import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getCustodioKpiData, 
  getCustodioMetrics, 
  getNewCustodiosByMonth, 
  getCustodioRetention, 
  getCustodioLtv,
  updateCustodioMetrics,
  CustodioMetrics
} from '@/services/custodioKpiService';
import { subMonths, subYears, format } from 'date-fns';

// Interface for comparison data
interface ComparisonData {
  totalRevenue: number;
  totalCustodios: number;
  cac: number;
  avgLtv: number;
  avgRetention: number | null;
  nps: number;
  marketingRoi: number;
  ltvCacRatio: number;
}

export function useCustodioKpi(months: number = 12, comparisonType: 'month' | 'year' = 'month') {
  const queryClient = useQueryClient();
  
  // Get current date
  const currentDate = new Date();
  
  // Calculate comparison date range based on comparison type
  const comparisonStartDate = comparisonType === 'month' 
    ? subMonths(currentDate, 1) 
    : subYears(currentDate, 1);
    
  const comparisonMonths = comparisonType === 'month'
    ? months
    : 12;  // For year comparison, we use the same length (12 months)
  
  // Current period queries
  const kpiDataQuery = useQuery({
    queryKey: ['custodioKpiData', months],
    queryFn: () => getCustodioKpiData(months),
  });
  
  const metricsQuery = useQuery({
    queryKey: ['custodioMetrics', months],
    queryFn: () => getCustodioMetrics(months),
  });
  
  const newCustodiosQuery = useQuery({
    queryKey: ['newCustodiosByMonth', months],
    queryFn: () => getNewCustodiosByMonth(months),
  });
  
  const retentionQuery = useQuery({
    queryKey: ['custodioRetention', months],
    queryFn: () => getCustodioRetention(months),
  });
  
  const ltvQuery = useQuery({
    queryKey: ['custodioLtv', months],
    queryFn: () => getCustodioLtv(months),
  });
  
  // Comparison period queries - only fetch if we need them
  const comparisonKpiDataQuery = useQuery({
    queryKey: ['custodioKpiData', 'comparison', comparisonType, comparisonMonths],
    queryFn: () => getCustodioKpiData(comparisonMonths),
    enabled: true, // We'll always fetch comparison data
  });
  
  const comparisonMetricsQuery = useQuery({
    queryKey: ['custodioMetrics', 'comparison', comparisonType, comparisonMonths],
    queryFn: () => getCustodioMetrics(comparisonMonths),
    enabled: true,
  });
  
  const comparisonLtvQuery = useQuery({
    queryKey: ['custodioLtv', 'comparison', comparisonType, comparisonMonths],
    queryFn: () => getCustodioLtv(comparisonMonths),
    enabled: true,
  });
  
  const comparisonRetentionQuery = useQuery({
    queryKey: ['custodioRetention', 'comparison', comparisonType, comparisonMonths],
    queryFn: () => getCustodioRetention(comparisonMonths),
    enabled: true,
  });
  
  // Mutation for updating manual metrics
  const updateMetricsMutation = useMutation({
    mutationFn: (metrics: Partial<CustodioMetrics>) => updateCustodioMetrics(metrics),
    onSuccess: () => {
      // Invalidate related queries to update them
      queryClient.invalidateQueries({ queryKey: ['custodioMetrics'] });
    },
  });
  
  // Calculate NPS based on data
  const calculateNps = (metricsData?: CustodioMetrics[]) => {
    if (!metricsData || metricsData.length === 0) return 0;
    
    // Take the most recent month
    const latestMetric = metricsData.slice(-1)[0];
    const promoters = latestMetric.nps_promoters || 0;
    const detractors = latestMetric.nps_detractors || 0;
    const total = promoters + detractors + (latestMetric.nps_neutral || 0);
    
    if (total === 0) return 0;
    return Math.round(((promoters - detractors) / total) * 100);
  };
  
  // Calculate CAC (Customer Acquisition Cost)
  const calculateCac = (metricsData?: CustodioMetrics[], newCustodiosData?: any[]) => {
    if (!metricsData || metricsData.length === 0 || !newCustodiosData) return 0;
    
    // Sum all costs from the latest available month
    const latestMetric = metricsData.slice(-1)[0];
    const totalCost = (latestMetric.staff_cost || 0) + 
                     (latestMetric.asset_cost || 0) + 
                     (latestMetric.marketing_cost || 0) +
                     (latestMetric.acquisition_cost_manual || 0);
    
    // Find the number of new custodios for that month
    const monthData = newCustodiosData.find(
      item => item.month_year === latestMetric.month_year
    );
    
    const newCustodios = monthData?.new_custodios || 1; // Avoid division by zero
    
    return totalCost / newCustodios;
  };
  
  // Calculate ROI of marketing campaigns
  const calculateMarketingRoi = (metricsData?: CustodioMetrics[]) => {
    if (!metricsData || metricsData.length === 0) return 0;
    
    // Filter only entries with campaign data
    const campaignMetrics = metricsData.filter(
      metric => metric.campaign_name && metric.campaign_cost > 0
    );
    
    if (campaignMetrics.length === 0) return 0;
    
    // Calculate ROI for each campaign and then average
    const totalRoi = campaignMetrics.reduce((sum, metric) => {
      const cost = metric.campaign_cost || 0;
      const revenue = metric.campaign_revenue || 0;
      
      if (cost === 0) return sum;
      // ROI = (Revenue - Cost) / Cost
      return sum + ((revenue - cost) / cost);
    }, 0);
    
    return (totalRoi / campaignMetrics.length) * 100; // As percentage
  };
  
  // Calculate average retention rate - improved to handle edge cases and ignore NULL/N/A values
  const calculateAvgRetention = (retentionData?: any[]) => {
    if (!retentionData) {
      console.log('DEBUG: No retention data available');
      return null;
    }
    
    console.log(`DEBUG: Raw retention data has ${retentionData.length} entries`);
    console.log('DEBUG: Sample of raw retention data:', retentionData.slice(0, 2));
    
    // Filter out NULL, N/A, zero, or undefined retention rates that might skew the average
    const validRetentionData = retentionData.filter(item => 
      item && 
      typeof item.retention_rate === 'number' && 
      !isNaN(item.retention_rate) && 
      item.retention_rate > 0
    );
    
    console.log(`DEBUG: After filtering, we have ${validRetentionData.length} valid retention data entries`);
    console.log('DEBUG: Sample of valid retention data:', validRetentionData.slice(0, 2));
    
    if (validRetentionData.length === 0) {
      console.log('DEBUG: No valid retention rates found after filtering NULL/N/A values');
      return null;
    }
    
    // Calculate the average retention rate from valid data points
    const totalRetention = validRetentionData.reduce(
      (sum, item) => sum + Number(item.retention_rate), 0
    );
    
    const avgRetention = totalRetention / validRetentionData.length;
    console.log(`DEBUG: Calculating avg retention from ${validRetentionData.length} valid months:`, 
      validRetentionData.map(d => parseFloat(d.retention_rate).toFixed(1)),
      `Avg: ${avgRetention.toFixed(2)}%`);
    
    return avgRetention;
  };
  
  // Calculate average LTV
  const calculateAvgLtv = (ltvData?: any[], months: number = 12) => {
    if (!ltvData || ltvData.length === 0) return 0;
    
    // Only consider active custodios - those with records in the selected period
    const activeCustodios = ltvData.filter(item => {
      // Check if the last service date is within the period
      const lastServiceDate = new Date(item.last_service_date);
      const cutoffDate = new Date();
      cutoffDate.setMonth(cutoffDate.getMonth() - months);
      return lastServiceDate >= cutoffDate;
    });
    
    if (activeCustodios.length === 0) return 0;
    
    // Calculate LTV only for active custodios
    const totalLtv = activeCustodios.reduce(
      (sum, item) => sum + (item.estimated_ltv || 0), 0
    );
    
    return totalLtv / activeCustodios.length;
  };
  
  // Calculate LTV:CAC ratio
  const calculateLtvCacRatio = (avgLtv: number, cac: number) => {
    if (cac === 0) return 0;
    return avgLtv / cac;
  };

  // Calculate current period metrics
  const nps = calculateNps(metricsQuery.data);
  const cac = calculateCac(metricsQuery.data, newCustodiosQuery.data);
  const marketingRoi = calculateMarketingRoi(metricsQuery.data);
  const avgRetention = calculateAvgRetention(retentionQuery.data);
  const avgLtv = calculateAvgLtv(ltvQuery.data, months);
  const ltvCacRatio = calculateLtvCacRatio(avgLtv, cac);
  
  // Calculate comparison period metrics
  const comparisonNps = calculateNps(comparisonMetricsQuery.data);
  const comparisonCac = calculateCac(comparisonMetricsQuery.data, newCustodiosQuery.data);
  const comparisonMarketingRoi = calculateMarketingRoi(comparisonMetricsQuery.data);
  const comparisonAvgRetention = calculateAvgRetention(comparisonRetentionQuery.data);
  const comparisonAvgLtv = calculateAvgLtv(comparisonLtvQuery.data, comparisonMonths);
  const comparisonLtvCacRatio = calculateLtvCacRatio(comparisonAvgLtv, comparisonCac);
  
  // Calculate total revenue for comparison period
  const comparisonTotalRevenue = comparisonKpiDataQuery.data
    ? comparisonKpiDataQuery.data.reduce((sum, item) => sum + item.total_revenue, 0)
    : 0;
    
  // Get total custodios for comparison period
  const comparisonTotalCustodios = comparisonKpiDataQuery.data && comparisonKpiDataQuery.data.length > 0
    ? comparisonKpiDataQuery.data[comparisonKpiDataQuery.data.length - 1]?.total_custodios || 0
    : 0;
  
  // Create comparison data object
  const previousPeriodData: ComparisonData = {
    totalRevenue: comparisonTotalRevenue,
    totalCustodios: comparisonTotalCustodios,
    cac: comparisonCac,
    avgLtv: comparisonAvgLtv,
    avgRetention: comparisonAvgRetention,
    nps: comparisonNps,
    marketingRoi: comparisonMarketingRoi,
    ltvCacRatio: comparisonLtvCacRatio
  };
  
  return {
    kpiData: kpiDataQuery.data,
    metrics: metricsQuery.data,
    newCustodios: newCustodiosQuery.data,
    retention: retentionQuery.data,
    ltv: ltvQuery.data,
    isLoading: kpiDataQuery.isLoading || 
               metricsQuery.isLoading || 
               newCustodiosQuery.isLoading || 
               retentionQuery.isLoading || 
               ltvQuery.isLoading ||
               comparisonKpiDataQuery.isLoading ||
               comparisonMetricsQuery.isLoading ||
               comparisonLtvQuery.isLoading ||
               comparisonRetentionQuery.isLoading,
    isError: kpiDataQuery.isError || 
             metricsQuery.isError || 
             newCustodiosQuery.isError || 
             retentionQuery.isError || 
             ltvQuery.isError ||
             comparisonKpiDataQuery.isError ||
             comparisonMetricsQuery.isError ||
             comparisonLtvQuery.isError ||
             comparisonRetentionQuery.isError,
    updateMetrics: updateMetricsMutation.mutate,
    isUpdating: updateMetricsMutation.isPending,
    // Derived calculations for current period
    nps,
    cac,
    marketingRoi,
    avgRetention,
    avgLtv,
    ltvCacRatio,
    // Comparison data
    previousPeriodData,
    comparisonType
  };
}
