
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, PhoneCall } from 'lucide-react';
import CallCenter from '../components/call-center';
import { LeadFormDialog } from '@/components/lead-form';
import { useToast } from '@/hooks/use-toast';
import LeadsTable from '@/components/leads/LeadsTable';
import LeadConfirmDialog from '@/components/leads/LeadConfirmDialog';
import { useLeadManager } from '@/hooks/useLeadManager';
import { useLeads } from '@/context/LeadsContext';

const Leads = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("leads");
  const { toast } = useToast();
  const { updateLeadStatus } = useLeads();
  
  const {
    dialogOpen,
    setDialogOpen,
    confirmDialogOpen,
    setConfirmDialogOpen,
    newLeadData,
    handleSubmitLeadForm,
    confirmAddLead
  } = useLeadManager();

  const handleCallLead = (leadId: number) => {
    setActiveTab("callcenter");
    // Pass selected lead to call center
    const event = new CustomEvent('selectLeadForCall', { detail: leadId });
    window.dispatchEvent(event);
  };

  return (
    <div className="container mx-auto px-6 py-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Leads</h1>
          <p className="text-muted-foreground mt-1">Administra y da seguimiento a tus prospectos</p>
        </div>
        
        <div className="flex gap-3 mt-4 md:mt-0">
          <Button 
            className="mt-4 md:mt-0" 
            onClick={() => setActiveTab("callcenter")} 
            variant={activeTab === "callcenter" ? "default" : "outline"}
          >
            <PhoneCall className="mr-2 h-4 w-4" />
            Call Center
          </Button>
          <Button className="mt-4 md:mt-0" onClick={() => setDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Nuevo Lead
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="callcenter">Control de Llamadas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="leads">
          <LeadsTable 
            isLoading={isLoading} 
            onCallLead={handleCallLead} 
          />
        </TabsContent>
        
        <TabsContent value="callcenter">
          <CallCenter 
            leads={[]} // This will be populated via context now
            onUpdateLeadStatus={updateLeadStatus} 
          />
        </TabsContent>
      </Tabs>

      <LeadFormDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
        onSubmit={handleSubmitLeadForm} 
      />
      
      <LeadConfirmDialog 
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        newLeadData={newLeadData}
        onConfirm={confirmAddLead}
      />
    </div>
  );
};

export default Leads;
