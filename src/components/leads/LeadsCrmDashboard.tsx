import React, { useMemo } from "react";
import { useLeads } from "@/context/LeadsContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LayoutDashboard, BarChart3, LineChart, PieChart, Activity, BellRing } from "lucide-react";
import { useFunnelStats, getMonthlyTrend, STAGES } from "./dashboard/crm/crmUtils";
import { fakeAlerts } from "./dashboard/crm/fakeAlerts";

// Import dashboard components
import MetricsCards from "./dashboard/crm/MetricsCards";
import FunnelChart from "./dashboard/crm/FunnelChart";
import MonthlyLineChart from "./dashboard/crm/MonthlyLineChart";
import ProfilePieChart from "./dashboard/crm/ProfilePieChart";
import StageTimeBarChart from "./dashboard/crm/StageTimeBarChart";
import AlertsPanel from "./dashboard/crm/AlertsPanel";
import RecentLeadsList from "./dashboard/crm/RecentLeadsList";
import LeadsByDaySourceChart from "./dashboard/crm/LeadsByDaySourceChart";
import { BusinessKpis } from "./dashboard/crm/BusinessKpis";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ContactedLeadsCard from "./dashboard/crm/ContactedLeadsCard";
import TotalLeadsCard from "./dashboard/crm/TotalLeadsCard";

const LeadsCrmDashboard: React.FC = () => {
  const { leads } = useLeads();
  const funnel = useFunnelStats(leads);
  const monthlyTrend = useMemo(() => getMonthlyTrend(leads), [leads]);
  const carTypes = [
    { name: "Con Vehículo", val: leads.filter(l => l.tieneVehiculo === "SI").length },
    { name: "Sin Vehículo", val: leads.filter(l => l.tieneVehiculo === "NO" || !l.tieneVehiculo).length },
    { name: "Armados", val: leads.filter(l => l.empresa?.includes("armado")).length },
    { name: "Sin Armamento", val: leads.filter(l => !l.empresa?.includes("armado")).length },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Dashboard Header */}
      <div className="flex items-center gap-2 mb-2">
        <LayoutDashboard className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-medium">Dashboard CRM de Custodios</h2>
      </div>
      
      {/* Dashboard Tabs - Añadimos una pestaña para KPIs de Negocio */}
      <Tabs defaultValue="leads">
        <TabsList className="mb-4">
          <TabsTrigger value="leads">Leads y Conversión</TabsTrigger>
          <TabsTrigger value="business">KPIs de Negocio</TabsTrigger>
        </TabsList>
        
        <TabsContent value="leads">
          {/* Contenido original del dashboard */}
          <div className="space-y-6">
            {/* Top metrics row - Modified to include Total Leads card */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
              {/* Total Leads card */}
              <div className="lg:col-span-1">
                <TotalLeadsCard />
              </div>
              
              {/* First card - Nuevos */}
              <div className="lg:col-span-1">
                <MetricsCards byStage={[funnel.byStage[0]]} conversions={[]} />
              </div>
              
              {/* Contactados from ContactedLeadsCard */}
              <div className="lg:col-span-1">
                <ContactedLeadsCard />
              </div>
              
              {/* Remaining cards */}
              <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <MetricsCards 
                  byStage={funnel.byStage.slice(2)}
                  conversions={funnel.conversions.slice(1)}
                />
              </div>
            </div>
            
            {/* Funnel and Monthly trend charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    <CardTitle className="text-base">Embudo de conversión</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-[280px]">
                    <FunnelChart byStage={funnel.byStage} />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <LineChart className="h-4 w-4 text-primary" />
                    <CardTitle className="text-base">Rendimiento mensual onboarding de leads</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-[280px]">
                    <MonthlyLineChart data={monthlyTrend} />
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Source chart row */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-secondary" />
                  <CardTitle className="text-base">Leads por día y fuente de ingreso</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[320px]">
                  <LeadsByDaySourceChart leads={leads} />
                </div>
              </CardContent>
            </Card>
            
            {/* Bottom charts and stats row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-1">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <PieChart className="h-4 w-4 text-secondary" />
                    <CardTitle className="text-base">Distribución perfiles</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-[220px]">
                    <ProfilePieChart carTypes={carTypes} />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="lg:col-span-1">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-secondary" />
                    <CardTitle className="text-base">Tiempo en cada etapa</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-[220px]">
                    <StageTimeBarChart leads={leads} />
                  </div>
                </CardContent>
              </Card>
              
              <div className="space-y-6">
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <BellRing className="h-4 w-4 text-secondary" />
                      <CardTitle className="text-base">Alertas & Recomendaciones</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <AlertsPanel alerts={fakeAlerts} />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Leads recientes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RecentLeadsList leads={leads} />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </TabsContent>
        
        {/* Nueva pestaña de KPIs de Negocio */}
        <TabsContent value="business">
          <BusinessKpis />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LeadsCrmDashboard;
