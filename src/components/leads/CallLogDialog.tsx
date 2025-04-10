
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VapiCallLog } from './types';
import { 
  CallLogHeader, 
  CallLogsTable, 
  CallStatsCards, 
  CallLogEmptyState, 
  CallLogsLoadingState,
  TranscriptViewer
} from './call-logs/components';

interface CallLogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leadName: string;
  leadPhone: string | null;
  callLogs: VapiCallLog[];
  loading: boolean;
}

const CallLogDialog: React.FC<CallLogDialogProps> = ({
  open,
  onOpenChange,
  leadName,
  leadPhone,
  callLogs,
  loading
}) => {
  const [selectedLog, setSelectedLog] = useState<VapiCallLog | null>(null);
  const [transcriptOpen, setTranscriptOpen] = useState(false);

  const handleViewTranscript = (log: VapiCallLog) => {
    setSelectedLog(log);
    setTranscriptOpen(true);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden border-0 shadow-lg rounded-xl">
          <CallLogHeader leadName={leadName} leadPhone={leadPhone} />
          
          <Tabs defaultValue="calls" className="px-6">
            <TabsList className="mb-4">
              <TabsTrigger value="calls">Llamadas</TabsTrigger>
              <TabsTrigger value="stats">Estadísticas</TabsTrigger>
            </TabsList>
            
            <TabsContent value="calls">
              <ScrollArea className="h-[400px]">
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
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="stats">
              <CallStatsCards callLogs={callLogs} />
            </TabsContent>
          </Tabs>
          
          <DialogFooter className="p-4 bg-slate-50 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-full px-4 py-1 h-8 text-sm">
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <TranscriptViewer 
        open={transcriptOpen} 
        onOpenChange={setTranscriptOpen} 
        log={selectedLog} 
      />
    </>
  );
};

export default CallLogDialog;
