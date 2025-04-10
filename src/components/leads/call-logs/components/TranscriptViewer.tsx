
import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Mic, User } from 'lucide-react';
import { VapiCallLog } from '../../types';

interface TranscriptViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  log: VapiCallLog | null;
}

// Define interfaces for the transcript data structure
interface TranscriptEntry {
  role: string;
  content: string;
}

export const TranscriptViewer: React.FC<TranscriptViewerProps> = ({
  open,
  onOpenChange,
  log
}) => {
  if (!log) return null;

  // Type guard function to check if the data is a transcript entry array
  const isTranscriptEntryArray = (data: any): data is TranscriptEntry[] => {
    return Array.isArray(data) && 
           data.length > 0 && 
           typeof data[0] === 'object' && 
           'role' in data[0] && 
           'content' in data[0];
  };

  const formatTranscript = () => {
    if (!log.transcript) return null;
    
    // Handle transcript based on its type
    if (isTranscriptEntryArray(log.transcript)) {
      return log.transcript.map((entry, idx) => (
        <div 
          key={idx} 
          className={`p-3 rounded-lg mb-3 ${entry.role === 'assistant' ? 'bg-primary/10 ml-6' : 'bg-muted mr-6'}`}
        >
          <div className="flex items-center gap-2 text-xs font-semibold mb-1">
            {entry.role === 'assistant' ? (
              <>
                <Mic className="h-3 w-3" />
                <span>Asistente</span>
              </>
            ) : (
              <>
                <User className="h-3 w-3" />
                <span>Cliente</span>
              </>
            )}
          </div>
          <p className="text-sm">{entry.content}</p>
        </div>
      ));
    } else if (typeof log.transcript === 'object') {
      // Render a JSON object version of the transcript
      return (
        <pre className="text-xs whitespace-pre-wrap bg-muted p-4 rounded-md">
          {JSON.stringify(log.transcript, null, 2)}
        </pre>
      );
    } else if (typeof log.transcript === 'string') {
      // Simple string transcript case
      return <p className="whitespace-pre-wrap text-sm">{log.transcript}</p>;
    }
    
    return null;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Transcripción de la llamada</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[400px] mt-4">
          <div className="space-y-2 px-1">
            {formatTranscript() || (
              <div className="text-center py-6 text-slate-400">
                No hay transcripción disponible para esta llamada
              </div>
            )}
          </div>
        </ScrollArea>
        
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
