import React, { useMemo } from "react";
import { useLeads } from "@/context/LeadsContext";
import MetricsCards from "./dashboard/crm/MetricsCards";
import FunnelChart from "./dashboard/crm/FunnelChart";
import MonthlyLineChart from "./dashboard/crm/MonthlyLineChart";
import ProfilePieChart from "./dashboard/crm/ProfilePieChart";
import StageTimeBarChart from "./dashboard/crm/StageTimeBarChart";
import AlertsPanel from "./dashboard/crm/AlertsPanel";
import RecentLeadsList from "./dashboard/crm/RecentLeadsList";
import LeadsByDaySourceChart from "./dashboard/crm/LeadsByDaySourceChart";
import { useFunnelStats, getMonthlyTrend, STAGES } from "./dashboard/crm/crmUtils";
import { fakeAlerts } from "./dashboard/crm/fakeAlerts";

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
    <div className="flex flex-col lg:flex-row gap-8 py-6 px-2 w-full animate-fade-in">
      <div className="flex-1 w-full flex flex-col gap-6">
        <div className="flex flex-col md:flex-row gap-4 items-stretch w-full">
          <MetricsCards byStage={funnel.byStage} conversions={funnel.conversions} />
          <FunnelChart byStage={funnel.byStage} />
        </div>
        <LeadsByDaySourceChart leads={leads} />
        <MonthlyLineChart data={monthlyTrend} />
        <div className="flex flex-col md:flex-row gap-6 mt-1 w-full">
          <ProfilePieChart carTypes={carTypes} />
          <StageTimeBarChart leads={leads} />
        </div>
      </div>
      <div className="md:w-[350px] w-full max-w-full flex-shrink-0 flex flex-col gap-6">
        <AlertsPanel alerts={fakeAlerts} />
        <RecentLeadsList leads={leads} />
      </div>
    </div>
  );
};

export default LeadsCrmDashboard;
