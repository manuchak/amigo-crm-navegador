
import React, { useState, useEffect } from 'react';
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

const LeadsCrmDashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { leads } = useLeads();
  
  // Mock data for funnel chart
  const funnelData = [
    { key: 'nuevo', label: 'Nuevos', value: 150, color: '#2563eb' },
    { key: 'contactado', label: 'Contactados', value: 85, color: '#f59e42' },
    { key: 'calificado', label: 'Calificados', value: 42, color: '#16a34a' },
    { key: 'contratado', label: 'Contratados', value: 15, color: '#8957e5' }
  ];
  
  // Mock data for profile pie chart
  const profileData = [
    { name: 'Con Vehículo', val: 45 },
    { name: 'Sin Vehículo', val: 35 },
    { name: 'Armados', val: 20 }
  ];
  
  // Mock data for metrics cards
  const byStage = [
    { key: 'nuevo', label: 'Nuevos', value: 150, percentage: 60 },
    { key: 'contactado', label: 'Contactados', value: 85, percentage: 35 },
    { key: 'calificado', label: 'Calificados', value: 42, percentage: 17 },
    { key: 'contratado', label: 'Contratados', value: 15, percentage: 6 }
  ];
  
  // Mock conversion rates
  const conversions = [null, 56.7, 49.4, 35.7];

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
