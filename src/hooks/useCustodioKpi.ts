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

export function useCustodioKpi(months: number = 12) {
  const queryClient = useQueryClient();
  
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
  
  // Mutation for updating manual metrics
  const updateMetricsMutation = useMutation({
    mutationFn: (metrics: Partial<CustodioMetrics>) => updateCustodioMetrics(metrics),
    onSuccess: () => {
      // Invalidate related queries to update them
      queryClient.invalidateQueries({ queryKey: ['custodioMetrics'] });
    },
  });
  
  // Calculate NPS based on data
  const calculateNps = () => {
    if (!metricsQuery.data || metricsQuery.data.length === 0) return 0;
    
    // Take the most recent month
    const latestMetric = metricsQuery.data.slice(-1)[0];
    const promoters = latestMetric.nps_promoters || 0;
    const detractors = latestMetric.nps_detractors || 0;
    const total = promoters + detractors + (latestMetric.nps_neutral || 0);
    
    if (total === 0) return 0;
    return Math.round(((promoters - detractors) / total) * 100);
  };
  
  // Calculate CAC (Customer Acquisition Cost)
  const calculateCac = () => {
    if (!metricsQuery.data || metricsQuery.data.length === 0 || !newCustodiosQuery.data) return 0;
    
    // Sum all costs from the latest available month
    const latestMetric = metricsQuery.data.slice(-1)[0];
    const totalCost = (latestMetric.staff_cost || 0) + 
                     (latestMetric.asset_cost || 0) + 
                     (latestMetric.marketing_cost || 0) +
                     (latestMetric.acquisition_cost_manual || 0);
    
    // Find the number of new custodios for that month
    const monthData = newCustodiosQuery.data.find(
      item => item.month_year === latestMetric.month_year
    );
    
    const newCustodios = monthData?.new_custodios || 1; // Avoid division by zero
    
    return totalCost / newCustodios;
  };
  
  // Calculate ROI of marketing campaigns
  const calculateMarketingRoi = () => {
    if (!metricsQuery.data || metricsQuery.data.length === 0) return 0;
    
    // Filter only entries with campaign data
    const campaignMetrics = metricsQuery.data.filter(
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
  const calculateAvgRetention = () => {
    if (!retentionQuery.data) {
      console.log('DEBUG: No retention data available');
      return null;
    }
    
    console.log(`DEBUG: Raw retention data has ${retentionQuery.data.length} entries`);
    
    // Filter out NULL, N/A, zero, or undefined retention rates that might skew the average
    const validRetentionData = retentionQuery.data.filter(item => 
      item && 
      item.retention_rate !== null && 
      !isNaN(item.retention_rate) && 
      item.retention_rate > 0
    );
    
    console.log(`DEBUG: After filtering, we have ${validRetentionData.length} valid retention data entries`);
    
    if (validRetentionData.length === 0) {
      console.log('DEBUG: No valid retention rates found after filtering NULL/N/A values');
      return null;
    }
    
    // Calculate the average retention rate from valid data points
    const totalRetention = validRetentionData.reduce(
      (sum, item) => sum + item.retention_rate, 0
    );
    
    const avgRetention = totalRetention / validRetentionData.length;
    console.log(`DEBUG: Calculating avg retention from ${validRetentionData.length} valid months:`, 
      validRetentionData.map(d => d.retention_rate.toFixed(1)),
      `Avg: ${avgRetention.toFixed(2)}%`);
    
    return avgRetention;
  };
  
  // Calculate average LTV
  const calculateAvgLtv = () => {
    if (!ltvQuery.data || ltvQuery.data.length === 0) return 0;
    
    // Only consider active custodios - those with records in the selected period
    const activeCustodios = ltvQuery.data.filter(item => {
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
  const calculateLtvCacRatio = () => {
    const avgLtv = calculateAvgLtv();
    const cac = calculateCac();
    
    if (cac === 0) return 0;
    return avgLtv / cac;
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
               ltvQuery.isLoading,
    isError: kpiDataQuery.isError || 
             metricsQuery.isError || 
             newCustodiosQuery.isError || 
             retentionQuery.isError || 
             ltvQuery.isError,
    updateMetrics: updateMetricsMutation.mutate,
    isUpdating: updateMetricsMutation.isPending,
    // Derived calculations
    nps: calculateNps(),
    cac: calculateCac(),
    marketingRoi: calculateMarketingRoi(),
    avgRetention: calculateAvgRetention(),
    avgLtv: calculateAvgLtv(),
    ltvCacRatio: calculateLtvCacRatio()
  };
}
