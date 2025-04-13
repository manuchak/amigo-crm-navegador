
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, PhoneCall, Mic, User, Bot } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface CallTranscriptProps {
  leadId: number;
  phoneNumber: string | null;
}

interface Transcript {
  timestamp: string;
  speaker: string;
  text: string;
}

interface CallLog {
  id: string;
  transcript: {
    transcript: Transcript[];
  } | null;
  start_time: string;
}

export const CallTranscript: React.FC<CallTranscriptProps> = ({ leadId, phoneNumber }) => {
  const [callLog, setCallLog] = useState<CallLog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCallTranscript = async () => {
      if (!phoneNumber) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // Fetch the most recent call with a transcript for this phone number
        const { data, error } = await supabase
          .from('vapi_call_logs')
          .select('id, transcript, start_time')
          .or(`phone_number.eq.${phoneNumber},caller_phone_number.eq.${phoneNumber}`)
          .not('transcript', 'is', null)
          .order('start_time', { ascending: false })
          .limit(1);
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          setCallLog(data[0] as CallLog);
        }
      } catch (error) {
        console.error('Error fetching call transcript:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCallTranscript();
  }, [phoneNumber]);
  
  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch (e) {
      return 'Hora desconocida';
    }
  };
  
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return 'Fecha desconocida';
    }
  };

  const renderTranscript = () => {
    if (!callLog?.transcript?.transcript) {
      return (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Mic className="h-12 w-12 text-slate-300 mb-4" />
          <p className="text-slate-500">No hay transcripción disponible para este custodio.</p>
          <p className="text-sm text-slate-400 mt-1">Realiza una llamada para generar una transcripción.</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-4 max-h-[400px] overflow-y-auto p-2">
        {callLog.transcript.transcript.map((item, index) => {
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
                  {isAssistant ? 
                    <Bot className="h-4 w-4 text-slate-500" /> : 
                    <User className="h-4 w-4 text-blue-500" />
                  }
                </div>
                <div>
                  <div className="text-xs font-medium mb-1">
                    {isAssistant ? 'Asistente' : 'Custodio'}
                    <span className="text-xs opacity-70 ml-2">
                      {formatTimestamp(item.timestamp)}
                    </span>
                  </div>
                  <div className="text-sm">{item.text}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <Card className="bg-white shadow-sm">
        <CardContent className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">
            <div className="flex items-center">
              <PhoneCall className="h-4 w-4 mr-2 text-primary" />
              Transcripción de Llamada
            </div>
          </CardTitle>
          {callLog && (
            <div className="text-xs text-muted-foreground">
              {formatDate(callLog.start_time)}
            </div>
          )}
        </div>
      </CardHeader>
      
      <Separator />
      
      <CardContent className="pt-4">
        {renderTranscript()}
      </CardContent>
    </Card>
  );
};
