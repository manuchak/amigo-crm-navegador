
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LeadCreationForm from '@/components/leads/LeadCreationForm';
import LeadsDashboard from '@/components/leads/LeadsDashboard';
import CallCenter from '@/components/call-center';
import { SupplyTeamDashboard } from '@/components/supply-team';
import { useLeads } from '@/context/LeadsContext';
import { Button } from '@/components/ui/button';
import { Download, UserCheck, Package } from 'lucide-react';
import QualifiedLeadsApproval from '@/components/leads/QualifiedLeadsApproval';
import LeadsIntro from '@/components/leads/LeadsIntro';

const Leads = () => {
  const [activeTab, setActiveTab] = useState("crear");
  const [showIntro, setShowIntro] = useState(true);
  const { leads, updateLeadStatus } = useLeads();

  // Check if user has visited before
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

  const handleDownloadCSV = () => {
    // Format the leads data for CSV
    const headers = ['ID', 'Nombre', 'Empresa', 'Contacto', 'Estado', 'Fecha Creación'];
    const csvData = leads.map(lead => [
      lead.id,
      lead.nombre,
      lead.empresa,
      lead.contacto,
      lead.estado,
      lead.fechaCreacion
    ]);
    
    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => 
        // Wrap cells with commas in quotes
        typeof cell === 'string' && cell.includes(',') 
          ? `"${cell}"` 
          : cell
      ).join(','))
    ].join('\n');
    
    // Create a blob and download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    // Set up download attributes
    link.setAttribute('href', url);
    link.setAttribute('download', `custodios-${new Date().toISOString().split('T')[0]}.csv`);
    
    // Trigger download and clean up
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (showIntro) {
    return <LeadsIntro onGetStarted={handleGetStarted} />;
  }

  return (
    <div className="container mx-auto px-6 py-20 text-gray-800 bg-gray-50">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Gestión de Custodios</h1>
          <p className="text-muted-foreground">Reclutamiento y seguimiento de custodios para servicios de seguridad</p>
        </div>
        
        <Button 
          onClick={handleDownloadCSV} 
          variant="outline" 
          className="mt-4 md:mt-0"
        >
          <Download className="mr-2 h-4 w-4" />
          Descargar CSV
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6 bg-white shadow-sm">
          <TabsTrigger value="crear">Crear Lead</TabsTrigger>
          <TabsTrigger value="seguimiento">Seguimiento</TabsTrigger>
          <TabsTrigger value="aprobacion">
            <UserCheck className="mr-1 h-4 w-4" />
            Aprobación
          </TabsTrigger>
          <TabsTrigger value="callcenter">Call Center</TabsTrigger>
          <TabsTrigger value="suministros">
            <Package className="mr-1 h-4 w-4" />
            Suministros
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="crear" className="mt-6">
          <LeadCreationForm />
        </TabsContent>
        
        <TabsContent value="seguimiento" className="mt-6">
          <LeadsDashboard />
        </TabsContent>
        
        <TabsContent value="aprobacion" className="mt-6">
          <QualifiedLeadsApproval />
        </TabsContent>
        
        <TabsContent value="callcenter" className="mt-6">
          <CallCenter 
            leads={leads}
            onUpdateLeadStatus={updateLeadStatus} 
          />
        </TabsContent>
        
        <TabsContent value="suministros" className="mt-6">
          <SupplyTeamDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Leads;
