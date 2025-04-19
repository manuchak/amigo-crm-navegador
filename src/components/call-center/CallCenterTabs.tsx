import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PhoneCall, MessageSquare, Filter, Users, Settings, RefreshCw } from 'lucide-react';
import CallCenter from './CallCenter';
import VapiCallLogs from './VapiCallLogs';
import QualifiedLeadsPanel from './QualifiedLeadsPanel';
import { VapiConfigPanel } from './vapi-config';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface CallCenterTabsProps {
  leads: any[];
  onUpdateLeadStatus: (leadId: number, newStatus: string) => void;
}

const CallCenterTabs = ({ leads, onUpdateLeadStatus }) => {
  const [activeTab, setActiveTab] = useState('dialer');
  const [vapiConfigured, setVapiConfigured] = useState<boolean | null>(null);
  const [refreshCallLogs, setRefreshCallLogs] = useState<number>(0);
  
  const handleVapiConfigUpdate = (isConfigured: boolean) => {
    setVapiConfigured(isConfigured);
  };

  const handleRefreshCallLogs = () => {
    setRefreshCallLogs(prev => prev + 1);
  };

  const showVapiConfigTab = false;

  return (
    <div className="w-full">
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
        </TabsList>
        
        <TabsContent value="dialer" className="mt-4">
          <CallCenter 
            leads={leads}
            onUpdateLeadStatus={onUpdateLeadStatus} 
          />
        </TabsContent>
        
        <TabsContent value="vapi-logs" className="mt-4">
          <VapiCallLogs 
            key={`logs-${refreshCallLogs}`} 
            limit={20} 
            onRefresh={handleRefreshCallLogs} 
          />
        </TabsContent>

        <TabsContent value="qualified-leads" className="mt-4">
          <QualifiedLeadsPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CallCenterTabs;
