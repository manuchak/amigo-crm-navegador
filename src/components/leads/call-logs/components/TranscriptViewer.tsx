
import React from 'react';
import { VapiCallLog } from '@/components/leads/types';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

export interface TranscriptViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  log: VapiCallLog | null;
}

type TranscriptItem = {
  speaker: string;
  text: string;
  timestamp: string;
} | {
  role: string;
  content: string;
};

export const TranscriptViewer: React.FC<TranscriptViewerProps> = ({
  open,
  onOpenChange,
  log
}) => {
  if (!log) return null;
  
  // Helper function to determine if data is a transcript array with the expected format
  const isTranscriptArray = (data: any): data is TranscriptItem[] => {
    if (!Array.isArray(data)) return false;
    if (data.length === 0) return false;
    
    // Check for either VAPI format or OpenAI format
    return ('speaker' in data[0] && 'text' in data[0]) || 
           ('role' in data[0] && 'content' in data[0]);
  };
  
  // Helper function to get normalized transcript data
  const getTranscriptData = (): TranscriptItem[] | null => {
    if (!log.transcript) return null;
    
    // Handle case where transcript is a JSON object with a 'transcript' array
    if (typeof log.transcript === 'object' && 
        log.transcript !== null && 
        'transcript' in log.transcript && 
        Array.isArray((log.transcript as any).transcript)) {
      return (log.transcript as any).transcript;
    }
    
    // Handle case where transcript is directly an array
    if (Array.isArray(log.transcript)) {
      return log.transcript as TranscriptItem[];
    }
    
    return null;
  };
  
  const transcriptData = getTranscriptData();
  const hasTranscript = transcriptData && isTranscriptArray(transcriptData);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Transcripción de Llamada</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[60vh] pr-4">
          {hasTranscript ? (
            <div className="space-y-4">
              {transcriptData.map((item, index) => {
                // Handle transcript items with speaker/text format
                if ('speaker' in item) {
                  const isAssistant = item.speaker.toLowerCase().includes('assistant');
                  
                  return (
                    <div 
                      key={index} 
                      className={`flex ${isAssistant ? 'justify-start' : 'justify-end'}`}
                    >
                      <div 
                        className={`flex max-w-[80%] rounded-lg p-3 ${
                          isAssistant 
                            ? 'bg-slate-100 text-slate-800' 
                            : 'bg-blue-50 text-blue-800'
                        }`}
                      >
                        <div className="mr-2 mt-1">
                          {isAssistant ? (
                            <div className="h-6 w-6 rounded-full bg-slate-300 flex items-center justify-center">A</div>
                          ) : (
                            <div className="h-6 w-6 rounded-full bg-blue-300 flex items-center justify-center">C</div>
                          )}
                        </div>
                        <div>
                          <div className="text-xs font-medium mb-1">
                            {isAssistant ? 'Asistente' : 'Cliente'}
                            {item.timestamp && (
                              <span className="text-xs opacity-70 ml-2">
                                {new Date(item.timestamp).toLocaleTimeString()}
                              </span>
                            )}
                          </div>
                          <div className="text-sm">{item.text}</div>
                        </div>
                      </div>
                    </div>
                  );
                }
                
                // Handle transcript items with role/content format
                if ('role' in item) {
                  const isAssistant = item.role === 'assistant';
                  
                  return (
                    <div 
                      key={index} 
                      className={`flex ${isAssistant ? 'justify-start' : 'justify-end'}`}
                    >
                      <div 
                        className={`flex max-w-[80%] rounded-lg p-3 ${
                          isAssistant 
                            ? 'bg-slate-100 text-slate-800' 
                            : 'bg-blue-50 text-blue-800'
                        }`}
                      >
                        <div className="mr-2 mt-1">
                          {isAssistant ? (
                            <div className="h-6 w-6 rounded-full bg-slate-300 flex items-center justify-center">A</div>
                          ) : (
                            <div className="h-6 w-6 rounded-full bg-blue-300 flex items-center justify-center">C</div>
                          )}
                        </div>
                        <div>
                          <div className="text-xs font-medium mb-1">
                            {isAssistant ? 'Asistente' : 'Cliente'}
                          </div>
                          <div className="text-sm">{item.content}</div>
                        </div>
                      </div>
                    </div>
                  );
                }
                
                return null;
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">
              {log.transcript ? (
                <div>
                  <p className="mb-4">Formato de transcripción no reconocido</p>
                  <pre className="text-xs whitespace-pre-wrap bg-slate-100 p-4 rounded overflow-auto">
                    {JSON.stringify(log.transcript, null, 2)}
                  </pre>
                </div>
              ) : (
                <p>No hay transcripción disponible para esta llamada</p>
              )}
            </div>
          )}
        </ScrollArea>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
          {log.recording_url && (
            <div className="mr-auto">
              <audio src={log.recording_url} controls className="w-64" />
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
