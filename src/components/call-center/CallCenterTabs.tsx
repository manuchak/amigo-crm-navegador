
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PhoneCall, MessageSquare, Filter, Users, Settings } from 'lucide-react';
import CallCenter from './CallCenter';
import VapiCallLogs from './VapiCallLogs';
import QualifiedLeadsPanel from './QualifiedLeadsPanel';
import VapiConfigPanel from './VapiConfigPanel';

interface CallCenterTabsProps {
  leads: any[];
  onUpdateLeadStatus: (leadId: number, newStatus: string) => void;
}

const CallCenterTabs: React.FC<CallCenterTabsProps> = ({ leads, onUpdateLeadStatus }) => {
  const [activeTab, setActiveTab] = useState('dialer');

  return (
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
        <VapiConfigPanel />
      </TabsContent>
    </Tabs>
  );
};

export default CallCenterTabs;
