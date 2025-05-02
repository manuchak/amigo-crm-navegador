
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FunnelChart } from './dashboard/crm/FunnelChart';
import { LeadsByDaySourceChart } from './dashboard/crm/LeadsByDaySourceChart';
import { MetricsCards } from './dashboard/crm/MetricsCards';
import { ProfilePieChart } from './dashboard/crm/ProfilePieChart';
import { RecentLeadsList } from './dashboard/crm/RecentLeadsList';
import { TotalLeadsCard } from './dashboard/crm/TotalLeadsCard';
import { QualifiedLeadsCard } from './dashboard/index';
import { ContactedLeadsCard } from './dashboard/crm/ContactedLeadsCard';
import { MetricsForm } from './dashboard/crm/MetricsForm';
import { StageTimeBarChart } from './dashboard/crm/StageTimeBarChart';
import { BusinessKpis } from './dashboard/crm/BusinessKpis';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AlertsPanel } from './dashboard/crm/AlertsPanel';

const LeadsCrmDashboard: React.FC = () => {
  return (
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
            <FunnelChart />
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4 min-h-[400px]">
            <h3 className="text-lg font-medium mb-4">Leads por Día y Fuente</h3>
            <LeadsByDaySourceChart />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="col-span-1 bg-white rounded-lg shadow-sm border p-4">
            <h3 className="text-lg font-medium mb-4">Perfil de Custodios</h3>
            <ProfilePieChart />
          </div>
          <div className="col-span-2 bg-white rounded-lg shadow-sm border p-4">
            <h3 className="text-lg font-medium mb-4">Tiempo en Etapas</h3>
            <StageTimeBarChart />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="col-span-1 lg:col-span-8 bg-white rounded-lg shadow-sm border p-4">
            <h3 className="text-lg font-medium mb-4">KPIs de Negocio</h3>
            <BusinessKpis />
          </div>
          <div className="col-span-1 lg:col-span-4 bg-white rounded-lg shadow-sm border p-4">
            <h3 className="text-lg font-medium mb-4">Últimos Leads</h3>
            <RecentLeadsList />
          </div>
        </div>

        <Tabs defaultValue="metrics">
          <TabsList className="mb-4">
            <TabsTrigger value="metrics">Métricas</TabsTrigger>
            <TabsTrigger value="alerts">Alertas</TabsTrigger>
          </TabsList>
          <TabsContent value="metrics" className="space-y-4">
            <MetricsCards />
            <MetricsForm />
          </TabsContent>
          <TabsContent value="alerts">
            <AlertsPanel />
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  );
};

export default LeadsCrmDashboard;
