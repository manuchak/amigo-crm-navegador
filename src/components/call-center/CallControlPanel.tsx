
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LeadSelector from './components/LeadSelector';
import CallButtons from './components/CallButtons';
import CallResultForm from './components/CallResultForm';

interface CallControlPanelProps {
  leads: { id: number; nombre: string; empresa: string; contacto: string; estado: string; fechaCreacion: string }[];
  selectedLead: number | null;
  setSelectedLead: (id: number | null) => void;
  isCallActive: boolean;
  callResult: string;
  setCallResult: (result: string) => void;
  notes: string;
  setNotes: (notes: string) => void;
  handleStartCall: () => Promise<void>;
  handleEndCall: () => void;
}

const CallControlPanel: React.FC<CallControlPanelProps> = ({
  leads,
  selectedLead,
  setSelectedLead,
  isCallActive,
  callResult,
  setCallResult,
  notes,
  setNotes,
  handleStartCall,
  handleEndCall
}) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-xl">Control de Llamadas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Lead selection and call controls */}
          <div className="space-y-4">
            <LeadSelector 
              leads={leads}
              selectedLead={selectedLead}
              setSelectedLead={setSelectedLead}
              isCallActive={isCallActive}
            />
            
            <CallButtons 
              isCallActive={isCallActive}
              selectedLead={selectedLead}
              handleStartCall={handleStartCall}
              handleEndCall={handleEndCall}
            />
          </div>
          
          {/* Call result form */}
          <CallResultForm 
            isCallActive={isCallActive}
            callResult={callResult}
            setCallResult={setCallResult}
            notes={notes}
            setNotes={setNotes}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default CallControlPanel;
