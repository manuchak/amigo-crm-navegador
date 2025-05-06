
import React, { useState } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import LeadsDashboard from '@/components/leads/LeadsDashboard';
import { LeadsProvider } from '@/context/LeadsContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate, useLocation } from 'react-router-dom';
import ProspectsPage from '@/components/leads/ProspectsPage';
import QualifiedLeadsApproval from '@/components/leads/QualifiedLeadsApproval';
import { LeadsCrmDashboard } from '@/components/leads/LeadsCrmDashboard';

const Leads: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  
  // Handle tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === 'prospects') {
      navigate('/leads/prospects');
    } else if (value === 'validation') {
      navigate('/leads/validation');
    } else if (value === 'crm') {
      navigate('/leads/crm');
    } else {
      navigate('/leads');
    }
  };
  
  // Set active tab based on current URL
  React.useEffect(() => {
    if (location.pathname.includes('/leads/prospects')) {
      setActiveTab('prospects');
    } else if (location.pathname.includes('/leads/validation')) {
      setActiveTab('validation');
    } else if (location.pathname.includes('/leads/crm')) {
      setActiveTab('crm');
    } else {
      setActiveTab('dashboard');
    }
  }, [location.pathname]);

  return (
    <PageLayout title="Leads">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="dashboard" className="text-sm">Dashboard de Leads</TabsTrigger>
          <TabsTrigger value="prospects" className="text-sm">Prospectos</TabsTrigger>
          <TabsTrigger value="validation" className="text-sm">Validación</TabsTrigger>
          <TabsTrigger value="crm" className="text-sm">CRM</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="mt-0">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <LeadsProvider>
              <LeadsDashboard />
            </LeadsProvider>
          </div>
        </TabsContent>
        
        <TabsContent value="prospects" className="mt-0">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <ProspectsPage />
          </div>
        </TabsContent>
        
        <TabsContent value="validation" className="mt-0">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <LeadsProvider>
              <QualifiedLeadsApproval />
            </LeadsProvider>
          </div>
        </TabsContent>
        
        <TabsContent value="crm" className="mt-0">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <LeadsProvider>
              <LeadsCrmDashboard />
            </LeadsProvider>
          </div>
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
};

export default Leads;
