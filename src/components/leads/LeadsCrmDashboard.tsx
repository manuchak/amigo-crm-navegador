
import React, { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TooltipProvider } from '@/components/ui/tooltip';
import FunnelChart from './dashboard/crm/FunnelChart';
import LeadsByDaySourceChart from './dashboard/crm/LeadsByDaySourceChart';
import MetricsCards from './dashboard/crm/MetricsCards';
import ProfilePieChart from './dashboard/crm/ProfilePieChart';
import RecentLeadsList from './dashboard/crm/RecentLeadsList';
import TotalLeadsCard from './dashboard/crm/TotalLeadsCard';
import { QualifiedLeadsCard } from './dashboard/index';
import ContactedLeadsCard from './dashboard/crm/ContactedLeadsCard';
import { MetricsForm } from './dashboard/crm/MetricsForm';
import StageTimeBarChart from './dashboard/crm/StageTimeBarChart';
import { BusinessKpis } from './dashboard/crm/BusinessKpis';
import AlertsPanel from './dashboard/crm/AlertsPanel';
import { useLeads } from '@/context/LeadsContext';
import { ContactedLeadsProvider } from './dashboard/crm/ContactedLeadsContext';
import { statusColors } from './dashboard/crm/crmUtils';

const LeadsCrmDashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { leads } = useLeads();
  
  // Generate data for funnel chart from leads
  const funnelData = useMemo(() => {
    const statusCounts = {
      nuevo: { key: 'nuevo', label: 'Nuevos', value: 0, color: statusColors[0] },
      contactado: { key: 'contactado', label: 'Contactados', value: 0, color: statusColors[1] },
      calificado: { key: 'calificado', label: 'Calificados', value: 0, color: statusColors[2] },
      contratado: { key: 'contratado', label: 'Contratados', value: 0, color: statusColors[3] }
    };
    
    leads.forEach(lead => {
      const status = lead.estado.toLowerCase();
      if (status in statusCounts) {
        statusCounts[status as keyof typeof statusCounts].value += 1;
      }
    });
    
    return Object.values(statusCounts);
  }, [leads]);
  
  // Generate data for profile pie chart
  const profileData = useMemo(() => {
    const vehicleCount = leads.filter(lead => lead.tieneVehiculo === 'SI').length;
    const armedCount = leads.filter(lead => (lead as any).esarmado === 'SI').length;
    const bothCount = leads.filter(
      lead => lead.tieneVehiculo === 'SI' && (lead as any).esarmado === 'SI'
    ).length;
    
    return [
      { name: 'Con Vehículo', val: vehicleCount - bothCount },
      { name: 'Sin Vehículo', val: leads.length - vehicleCount - armedCount + bothCount },
      { name: 'Armados', val: armedCount - bothCount },
      { name: 'Con Vehículo y Armados', val: bothCount }
    ];
  }, [leads]);
  
  // Generate metrics data
  const byStage = useMemo(() => {
    const statusCounts = {
      nuevo: 0,
      contactado: 0,
      calificado: 0,
      contratado: 0
    };
    
    leads.forEach(lead => {
      const status = lead.estado.toLowerCase();
      if (status in statusCounts) {
        statusCounts[status as keyof typeof statusCounts] += 1;
      }
    });
    
    return [
      { key: 'nuevo', label: 'Nuevos', value: statusCounts.nuevo, percentage: (statusCounts.nuevo / leads.length) * 100 || 0 },
      { key: 'contactado', label: 'Contactados', value: statusCounts.contactado, percentage: (statusCounts.contactado / leads.length) * 100 || 0 },
      { key: 'calificado', label: 'Calificados', value: statusCounts.calificado, percentage: (statusCounts.calificado / leads.length) * 100 || 0 },
      { key: 'contratado', label: 'Contratados', value: statusCounts.contratado, percentage: (statusCounts.contratado / leads.length) * 100 || 0 }
    ];
  }, [leads]);
  
  // Calculate conversion rates
  const conversions = useMemo(() => {
    const rates = [null];
    if (byStage[0].value > 0) {
      rates.push((byStage[1].value / byStage[0].value) * 100);
    } else {
      rates.push(0);
    }
    
    if (byStage[1].value > 0) {
      rates.push((byStage[2].value / byStage[1].value) * 100);
    } else {
      rates.push(0);
    }
    
    if (byStage[2].value > 0) {
      rates.push((byStage[3].value / byStage[2].value) * 100);
    } else {
      rates.push(0);
    }
    
    return rates;
  }, [byStage]);

  // Handler for saving metrics
  const handleSaveMetrics = async (data: any) => {
    setIsLoading(true);
    try {
      // Here you would typically save the metrics data
      console.log("Saving metrics:", data);
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
    } catch (error) {
      console.error("Error saving metrics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ContactedLeadsProvider>
      <TooltipProvider>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <TotalLeadsCard />
            <ContactedLeadsCard />
            <QualifiedLeadsCard />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg shadow-sm border p-4 min-h-[400px]">
              <h3 className="text-lg font-medium mb-4">Conversión por Etapa</h3>
              <FunnelChart byStage={funnelData} />
            </div>
            <div className="bg-white rounded-lg shadow-sm border p-4 min-h-[400px]">
              <h3 className="text-lg font-medium mb-4">Leads por Día y Fuente</h3>
              <LeadsByDaySourceChart leads={leads} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="col-span-1 bg-white rounded-lg shadow-sm border p-4">
              <h3 className="text-lg font-medium mb-4">Perfil de Custodios</h3>
              <ProfilePieChart carTypes={profileData} />
            </div>
            <div className="col-span-2 bg-white rounded-lg shadow-sm border p-4">
              <h3 className="text-lg font-medium mb-4">Tiempo en Etapas</h3>
              <StageTimeBarChart leads={leads} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="col-span-1 lg:col-span-8 bg-white rounded-lg shadow-sm border p-4">
              <h3 className="text-lg font-medium mb-4">KPIs de Negocio</h3>
              <BusinessKpis />
            </div>
            <div className="col-span-1 lg:col-span-4 bg-white rounded-lg shadow-sm border p-4">
              <h3 className="text-lg font-medium mb-4">Últimos Leads</h3>
              <RecentLeadsList leads={leads.slice(0, 3)} />
            </div>
          </div>

          <Tabs defaultValue="metrics">
            <TabsList className="mb-4">
              <TabsTrigger value="metrics">Métricas</TabsTrigger>
              <TabsTrigger value="alerts">Alertas</TabsTrigger>
            </TabsList>
            <TabsContent value="metrics" className="space-y-4">
              <MetricsCards byStage={byStage} conversions={conversions} />
              <MetricsForm 
                onSave={handleSaveMetrics} 
                isLoading={isLoading} 
              />
            </TabsContent>
            <TabsContent value="alerts">
              <AlertsPanel />
            </TabsContent>
          </Tabs>
        </div>
      </TooltipProvider>
    </ContactedLeadsProvider>
  );
};

export default LeadsCrmDashboard;
