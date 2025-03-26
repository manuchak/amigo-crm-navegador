
import React from 'react';
import { useCallCenter } from './useCallCenter';
import CallControlPanel from './CallControlPanel';
import CallHistory from './CallHistory';
import CallStats from './CallStats';
import { CallCenterProps } from './types';
import { useLeads } from '@/context/LeadsContext';

const CallCenter: React.FC<CallCenterProps> = ({ onUpdateLeadStatus }) => {
  const { leads } = useLeads();
  const {
    selectedLead,
    setSelectedLead,
    callResult,
    setCallResult,
    notes,
    setNotes,
    callsForToday,
    isCallActive,
    handleStartCall,
    handleEndCall
  } = useCallCenter({ leads, onUpdateLeadStatus });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Panel de control principal */}
      <div className="lg:col-span-8 space-y-6">
        <CallControlPanel
          leads={leads}
          selectedLead={selectedLead}
          setSelectedLead={setSelectedLead}
          isCallActive={isCallActive}
          callResult={callResult}
          setCallResult={setCallResult}
          notes={notes}
          setNotes={setNotes}
          handleStartCall={handleStartCall}
          handleEndCall={handleEndCall}
        />
        
        <CallHistory callsForToday={callsForToday} />
      </div>
      
      {/* Panel lateral de estadísticas */}
      <div className="lg:col-span-4 space-y-6">
        <CallStats leads={leads} callsForToday={callsForToday} />
      </div>
    </div>
  );
};

export default CallCenter;
