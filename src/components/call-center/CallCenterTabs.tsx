
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PhoneCall, MessageSquare, Filter, Users, Settings } from 'lucide-react';
import CallCenter from './CallCenter';
import VapiCallLogs from './VapiCallLogs';
import QualifiedLeadsPanel from './QualifiedLeadsPanel';
import VapiConfigPanel from './VapiConfigPanel';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface CallCenterTabsProps {
  leads: any[];
  onUpdateLeadStatus: (leadId: number, newStatus: string) => void;
}

const CallCenterTabs: React.FC<CallCenterTabsProps> = ({ leads, onUpdateLeadStatus }) => {
  const [activeTab, setActiveTab] = useState('dialer');
  const [vapiConfigured, setVapiConfigured] = useState<boolean | null>(null);
  
  // Function to update VAPI configuration status
  const handleVapiConfigUpdate = (isConfigured: boolean) => {
    setVapiConfigured(isConfigured);
  };

  return (
    <div className="space-y-4">
      {vapiConfigured === false && activeTab !== 'vapi-config' && (
        <Alert variant="warning" className="bg-amber-50 border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800">Configuración de VAPI pendiente</AlertTitle>
          <AlertDescription className="text-amber-700">
            La API de VAPI no está configurada correctamente. Por favor, configura tu clave API para habilitar las funciones de llamadas.
          </AlertDescription>
        </Alert>
      )}
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="dialer">
            <PhoneCall className="mr-1 h-4 w-4" />
            Marcador
          </TabsTrigger>
          <TabsTrigger value="vapi-logs">
            <MessageSquare className="mr-1 h-4 w-4" />
            Registros VAPI
          </TabsTrigger>
          <TabsTrigger value="qualified-leads">
            <Users className="mr-1 h-4 w-4" />
            Leads Calificados
          </TabsTrigger>
          <TabsTrigger value="vapi-config">
            <Settings className="mr-1 h-4 w-4" />
            Configuración API
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="dialer" className="mt-4">
          <CallCenter 
            leads={leads}
            onUpdateLeadStatus={onUpdateLeadStatus} 
          />
        </TabsContent>
        
        <TabsContent value="vapi-logs" className="mt-4">
          <VapiCallLogs limit={20} />
        </TabsContent>

        <TabsContent value="qualified-leads" className="mt-4">
          <QualifiedLeadsPanel />
        </TabsContent>

        <TabsContent value="vapi-config" className="mt-4">
          <VapiConfigPanel onConfigUpdate={handleVapiConfigUpdate} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CallCenterTabs;
