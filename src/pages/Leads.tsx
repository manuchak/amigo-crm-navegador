
import React, { useState } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import LeadsDashboard from '@/components/leads/LeadsDashboard';
import { LeadsProvider } from '@/context/LeadsContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate, useLocation } from 'react-router-dom';
import ProspectsPage from './Prospects';

const Leads: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  
  // Handle tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === 'prospects') {
      navigate('/leads/prospects');
    } else {
      navigate('/leads');
    }
  };
  
  // Set active tab based on current URL
  React.useEffect(() => {
    if (location.pathname.includes('/leads/prospects')) {
      setActiveTab('prospects');
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
            <h2 className="text-xl font-semibold mb-4">Validación de Leads</h2>
            <p className="text-muted-foreground">Módulo de validación de leads.</p>
          </div>
        </TabsContent>
        
        <TabsContent value="crm" className="mt-0">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">CRM de Leads</h2>
            <p className="text-muted-foreground">Gestión de relaciones con leads calificados.</p>
          </div>
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
};

export default Leads;
