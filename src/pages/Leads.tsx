import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LeadCreationForm from '@/components/leads/LeadCreationForm';
import LeadsDashboard from '@/components/leads/LeadsDashboard';
import CallCenter from '@/components/call-center';
import { SupplyTeamDashboard } from '@/components/supply-team';
import { useLeads } from '@/context/LeadsContext';
import { Button } from '@/components/ui/button';
import { Download, UserCheck, Package, WebhookIcon, Database } from 'lucide-react';
import QualifiedLeadsApproval from '@/components/leads/QualifiedLeadsApproval';
import LeadsIntro from '@/components/leads/LeadsIntro';
import { toast } from 'sonner';
import { executeWebhook, fetchLeadsFromExternalDatabase, LEADS_WEBHOOK_URL } from '@/components/call-center/utils/webhook';

const Leads = () => {
  const [activeTab, setActiveTab] = useState("crear");
  const [showIntro, setShowIntro] = useState(true);
  const { leads, updateLeadStatus, setLeads } = useLeads();
  const [isWebhookSyncing, setIsWebhookSyncing] = useState(false);
  const [isLeadsImporting, setIsLeadsImporting] = useState(false);

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

  const handleSyncWithExternalSystems = async () => {
    setIsWebhookSyncing(true);
    
    try {
      // Send a summary of our leads to the external webhook
      await executeWebhook({
        action: "sync_leads_data",
        timestamp: new Date().toISOString(),
        totalLeads: leads.length,
        leadsSummary: leads.map(lead => ({
          id: lead.id,
          nombre: lead.nombre,
          empresa: lead.empresa,
          estado: lead.estado,
          fechaCreacion: lead.fechaCreacion
        }))
      });
      
      toast.success('Datos sincronizados correctamente con sistemas externos');
    } catch (error) {
      console.error("Error syncing with external systems:", error);
      toast.error('Error al sincronizar datos');
    } finally {
      setIsWebhookSyncing(false);
    }
  };

  const handleImportLeadsFromDatabase = async () => {
    setIsLeadsImporting(true);
    
    try {
      const response = await fetchLeadsFromExternalDatabase();
      
      if (response && Array.isArray(response)) {
        // Convert the imported leads to the application's Lead format
        const importedLeads = response.map((item, index) => ({
          id: parseInt(item.id) || Date.now() + index,
          nombre: item.nombre || item.name || "Sin nombre",
          empresa: item.empresa || item.company || "Custodio",
          contacto: item.email ? 
            `${item.email} | ${item.telefono || item.phone || ""}` : 
            (item.telefono || item.phone || "Sin contacto"),
          estado: item.estado || item.status || "Nuevo",
          fechaCreacion: item.fechaCreacion || item.createdAt || new Date().toISOString().split('T')[0]
        }));
        
        // Merge with existing leads, avoiding duplicates by ID
        const existingIds = new Set(leads.map(lead => lead.id));
        const newLeads = importedLeads.filter(lead => !existingIds.has(lead.id));
        
        if (newLeads.length > 0) {
          setLeads([...newLeads, ...leads]);
          toast.success(`${newLeads.length} nuevos leads importados correctamente`);
        } else {
          toast.info('No se encontraron nuevos leads para importar');
        }
      } else if (response && response.message) {
        // Handle message response
        toast.success(`Respuesta del servidor: ${response.message}`);
      } else {
        throw new Error('Formato de respuesta no válido');
      }
    } catch (error) {
      console.error("Error importing leads:", error);
      toast.error(`Error al importar leads: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setIsLeadsImporting(false);
    }
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
        
        <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
          <Button 
            onClick={handleDownloadCSV} 
            variant="outline" 
          >
            <Download className="mr-2 h-4 w-4" />
            Descargar CSV
          </Button>
          
          <Button 
            onClick={handleSyncWithExternalSystems} 
            variant="outline"
            disabled={isWebhookSyncing}
          >
            <WebhookIcon className={`mr-2 h-4 w-4 ${isWebhookSyncing ? 'animate-spin' : ''}`} />
            Sincronizar Datos
          </Button>
          
          <Button 
            onClick={handleImportLeadsFromDatabase} 
            variant="outline"
            disabled={isLeadsImporting}
          >
            <Database className={`mr-2 h-4 w-4 ${isLeadsImporting ? 'animate-spin' : ''}`} />
            Importar Leads
          </Button>
        </div>
      </div>
      
      <div className="mb-4 p-4 bg-white rounded-lg shadow-sm border border-gray-100">
        <h3 className="text-sm font-medium mb-2">Webhook de Datos de Leads</h3>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <code className="text-xs bg-gray-100 p-2 rounded flex-1 overflow-auto">{LEADS_WEBHOOK_URL}</code>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              navigator.clipboard.writeText(LEADS_WEBHOOK_URL);
              toast.success("URL copiada al portapapeles");
            }}
          >
            Copiar URL
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Envía una petición GET a este endpoint para probar, o configúralo en tu sistema como destino de webhook.
        </p>
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
