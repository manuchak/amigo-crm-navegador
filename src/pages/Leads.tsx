
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LeadCreationForm from '@/components/leads/LeadCreationForm';
import LeadsDashboard from '@/components/leads/LeadsDashboard';
import CallCenter from '@/components/call-center';
import { useLeads } from '@/context/LeadsContext';

const Leads = () => {
  const [activeTab, setActiveTab] = useState("crear");
  const { leads, updateLeadStatus } = useLeads();

  return (
    <div className="container mx-auto px-6 py-20 text-white">
      <h1 className="text-3xl font-bold tracking-tight mb-2">Gestión de Custodios</h1>
      <p className="text-muted-foreground mb-6">Reclutamiento y seguimiento de custodios para servicios de seguridad</p>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-gray-800/50 mb-6">
          <TabsTrigger value="crear">Crear Lead</TabsTrigger>
          <TabsTrigger value="seguimiento">Seguimiento</TabsTrigger>
          <TabsTrigger value="callcenter">Call Center</TabsTrigger>
        </TabsList>
        
        <TabsContent value="crear" className="mt-6">
          <LeadCreationForm />
        </TabsContent>
        
        <TabsContent value="seguimiento" className="mt-6">
          <LeadsDashboard />
        </TabsContent>
        
        <TabsContent value="callcenter" className="mt-6">
          <CallCenter 
            onUpdateLeadStatus={updateLeadStatus} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Leads;
