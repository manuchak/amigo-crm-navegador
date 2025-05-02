
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
  
  // Mutación para actualizar métricas manuales
  const updateMetricsMutation = useMutation({
    mutationFn: (metrics: Partial<CustodioMetrics>) => updateCustodioMetrics(metrics),
    onSuccess: () => {
      // Invalidar queries relacionadas para que se actualicen
      queryClient.invalidateQueries({ queryKey: ['custodioMetrics'] });
    },
  });
  
  // Calcular el NPS basado en los datos
  const calculateNps = () => {
    if (!metricsQuery.data || metricsQuery.data.length === 0) return 0;
    
    // Tomar el mes más reciente
    const latestMetric = metricsQuery.data.slice(-1)[0];
    const promoters = latestMetric.nps_promoters || 0;
    const detractors = latestMetric.nps_detractors || 0;
    const total = promoters + detractors + (latestMetric.nps_neutral || 0);
    
    if (total === 0) return 0;
    return Math.round(((promoters - detractors) / total) * 100);
  };
  
  // Calcular CAC (Customer Acquisition Cost)
  const calculateCac = () => {
    if (!metricsQuery.data || metricsQuery.data.length === 0 || !newCustodiosQuery.data) return 0;
    
    // Sumar todos los costos del último mes disponible
    const latestMetric = metricsQuery.data.slice(-1)[0];
    const totalCost = (latestMetric.staff_cost || 0) + 
                     (latestMetric.asset_cost || 0) + 
                     (latestMetric.marketing_cost || 0) +
                     (latestMetric.acquisition_cost_manual || 0);
    
    // Encontrar el número de nuevos custodios para ese mes
    const monthData = newCustodiosQuery.data.find(
      item => item.month_year === latestMetric.month_year
    );
    
    const newCustodios = monthData?.new_custodios || 0;
    
    if (newCustodios === 0) return totalCost; // Evitar división por cero
    return totalCost / newCustodios;
  };
  
  // Calcular el ROI de las campañas de marketing
  const calculateMarketingRoi = () => {
    if (!metricsQuery.data || metricsQuery.data.length === 0) return 0;
    
    // Filtrar solo las entradas que tengan datos de campaña
    const campaignMetrics = metricsQuery.data.filter(
      metric => metric.campaign_name && metric.campaign_cost > 0
    );
    
    if (campaignMetrics.length === 0) return 0;
    
    // Calcular ROI para cada campaña y luego promediar
    const totalRoi = campaignMetrics.reduce((sum, metric) => {
      const cost = metric.campaign_cost || 0;
      const revenue = metric.campaign_revenue || 0;
      
      if (cost === 0) return sum;
      // ROI = (Revenue - Cost) / Cost
      return sum + ((revenue - cost) / cost);
    }, 0);
    
    return (totalRoi / campaignMetrics.length) * 100; // Porcentaje
  };
  
  // Cálculo del promedio de retención
  const calculateAvgRetention = () => {
    if (!retentionQuery.data || retentionQuery.data.length === 0) return 0;
    
    const totalRetention = retentionQuery.data.reduce(
      (sum, item) => sum + (item.retention_rate || 0), 0
    );
    
    return totalRetention / retentionQuery.data.length;
  };
  
  // Calcular LTV promedio
  const calculateAvgLtv = () => {
    if (!ltvQuery.data || ltvQuery.data.length === 0) return 0;
    
    const totalLtv = ltvQuery.data.reduce(
      (sum, item) => sum + (item.estimated_ltv || 0), 0
    );
    
    return totalLtv / ltvQuery.data.length;
  };
  
  // Calcular relación LTV:CAC
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
    // Cálculos derivados
    nps: calculateNps(),
    cac: calculateCac(),
    marketingRoi: calculateMarketingRoi(),
    avgRetention: calculateAvgRetention(),
    avgLtv: calculateAvgLtv(),
    ltvCacRatio: calculateLtvCacRatio()
  };
}
