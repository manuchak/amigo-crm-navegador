
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LeadCreationForm from '@/components/leads/LeadCreationForm';
import LeadsDashboard from '@/components/leads/LeadsDashboard';
import CallCenterTabs from '@/components/call-center/CallCenterTabs';
import { SupplyTeamDashboard } from '@/components/supply-team';
import { useLeads } from '@/context/LeadsContext';
import { UserCheck, Package, Loader2, LayoutDashboard, Users } from 'lucide-react';
import QualifiedLeadsApproval from '@/components/leads/QualifiedLeadsApproval';
import LeadsIntro from '@/components/leads/LeadsIntro';
import LeadsCrmDashboard from '@/components/leads/LeadsCrmDashboard';
import ProspectsPage from '@/components/leads/ProspectsPage';
import { TooltipProvider } from '@/components/ui/tooltip';

const Leads = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showIntro, setShowIntro] = useState(true);
  const { leads, updateLeadStatus, loading, error, refetchLeads } = useLeads();

  useEffect(() => {
    const hasVisitedLeads = localStorage.getItem('hasVisitedLeads');
    if (hasVisitedLeads) {
      setShowIntro(false);
    }
  }, []);

  const handleGetStarted = () => {
    setShowIntro(false);
    localStorage.setItem('hasVisitedLeads', 'true');
  };

  if (showIntro) {
    return <LeadsIntro onGetStarted={handleGetStarted} />;
  }

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-20 text-gray-800 bg-gray-50">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
          <h2 className="text-xl font-medium">Cargando leads...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-6 py-20 text-gray-800 bg-gray-50">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
          <button 
            onClick={refetchLeads}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
          >
            Intentar de nuevo
          </button>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="container mx-auto px-6 py-16 bg-white">
        <div className="mb-6">
          <h1 className="text-2xl font-medium mb-1">Gestión de Custodios</h1>
          <p className="text-slate-500 text-sm">
            Reclutamiento y seguimiento de custodios para servicios de seguridad
          </p>
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6 bg-slate-100 p-1 rounded-lg">
            <TabsTrigger value="dashboard" className="rounded-md font-semibold">
              <LayoutDashboard className="h-4 w-4 mr-1" />
              Resumen CRM
            </TabsTrigger>
            <TabsTrigger value="seguimiento" className="rounded-md">Seguimiento</TabsTrigger>
            <TabsTrigger value="prospectos" className="rounded-md">
              <Users className="h-4 w-4 mr-1" />
              Prospectos
            </TabsTrigger>
            <TabsTrigger value="aprobacion" className="rounded-md">
              <UserCheck className="mr-1 h-4 w-4" />
              Aprobación
            </TabsTrigger>
            <TabsTrigger value="callcenter" className="rounded-md">Call Center</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-4">
            <LeadsCrmDashboard />
          </TabsContent>

          <TabsContent value="seguimiento" className="mt-4">
            <LeadsDashboard />
          </TabsContent>
          
          <TabsContent value="prospectos" className="mt-4">
            <ProspectsPage />
          </TabsContent>

          <TabsContent value="aprobacion" className="mt-4">
            <QualifiedLeadsApproval />
          </TabsContent>

          <TabsContent value="callcenter" className="mt-4">
            <CallCenterTabs
              leads={leads}
              onUpdateLeadStatus={updateLeadStatus}
            />
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  );
};

export default Leads;
