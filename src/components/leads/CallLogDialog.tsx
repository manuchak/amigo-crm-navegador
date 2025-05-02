
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useLeadCallLogs } from '@/hooks/lead-call-logs';
import { CallLogsLoadingState, CallLogEmptyState, CallStatsCards, CallLogsTable, TranscriptViewer } from './call-logs/components';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VapiCallLog } from './types';

export interface CallLogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leadName: string;
  leadPhone?: string;
  leadId: number;
}

const CallLogDialog: React.FC<CallLogDialogProps> = ({
  open,
  onOpenChange,
  leadName,
  leadPhone,
  leadId
}) => {
  const [activeTab, setActiveTab] = useState<string>('calls');
  const [selectedCallId, setSelectedCallId] = useState<string | null>(null);
  const [showTranscript, setShowTranscript] = useState(false);
  const { callLogs, loading } = useLeadCallLogs(leadId, leadPhone || null);
  
  const handleViewTranscript = (log: VapiCallLog) => {
    setSelectedCallId(log.log_id || log.id);
    setShowTranscript(true);
  };

  const currentCall = selectedCallId 
    ? callLogs.find(log => (log.log_id === selectedCallId || log.id === selectedCallId)) 
    : null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Historial de llamadas: {leadName}
            </DialogTitle>
            {leadPhone && <p className="text-sm text-muted-foreground">Teléfono: {leadPhone}</p>}
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
            <TabsList className="bg-slate-100 mb-4">
              <TabsTrigger value="calls" className="text-sm">Registro de llamadas</TabsTrigger>
              <TabsTrigger value="stats" className="text-sm">Estadísticas</TabsTrigger>
            </TabsList>
            
            <TabsContent value="calls">
              {loading ? (
                <CallLogsLoadingState />
              ) : callLogs.length === 0 ? (
                <CallLogEmptyState />
              ) : (
                <CallLogsTable 
                  callLogs={callLogs} 
                  onViewTranscript={handleViewTranscript} 
                />
              )}
            </TabsContent>
            
            <TabsContent value="stats">
              <CallStatsCards callLogs={callLogs} />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {currentCall && (
        <TranscriptViewer
          open={showTranscript}
          onOpenChange={setShowTranscript}
          log={currentCall}
        />
      )}
    </>
  );
};

export default CallLogDialog;
