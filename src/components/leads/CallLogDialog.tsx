
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useLeadCallLogs } from '@/hooks/useLeadCallLogs';
import { CallLogsLoadingState, CallLogEmptyState, CallStatsCards, CallLogsTable, TranscriptViewer } from './call-logs/components';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
  const { callLogs, isLoading, error } = useLeadCallLogs(leadId);
  
  const handleViewTranscript = (callId: string) => {
    setSelectedCallId(callId);
    setActiveTab('transcript');
  };

  const currentCall = selectedCallId 
    ? callLogs.find(log => log.log_id === selectedCallId) 
    : null;

  return (
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
            <TabsTrigger value="transcript" className="text-sm" disabled={!selectedCallId}>Transcripción</TabsTrigger>
          </TabsList>
          
          <TabsContent value="calls">
            {isLoading ? (
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
          
          <TabsContent value="transcript">
            {currentCall?.transcript ? (
              <div className="space-y-4">
                <div className="bg-slate-50 rounded-md p-3 mb-4">
                  {currentCall.recording_url && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-slate-500 mb-1">Grabación de llamada:</p>
                      <audio 
                        src={currentCall.recording_url} 
                        controls 
                        className="w-full"
                      />
                    </div>
                  )}
                </div>
                <TranscriptViewer transcript={currentCall.transcript} />
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500">
                <p>No hay transcripción disponible para esta llamada</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default CallLogDialog;
