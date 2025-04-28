
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, AlertTriangle, MessageCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CallTranscriptProps {
  leadId: number;
  phoneNumber: string | null;
}

export const CallTranscript: React.FC<CallTranscriptProps> = ({ 
  leadId, 
  phoneNumber 
}) => {
  const [transcript, setTranscript] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTranscript() {
      if (!phoneNumber) {
        setError('No hay número telefónico disponible');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Format phone number for search by removing non-digits
        const formattedPhone = phoneNumber.replace(/\D/g, '');
        const lastTenDigits = formattedPhone.slice(-10);
        
        // Query call logs with transcripts
        const { data, error } = await supabase
          .from('vapi_call_logs')
          .select('transcript')
          .or(`phone_number.ilike.%${lastTenDigits}%,caller_phone_number.ilike.%${lastTenDigits}%`)
          .not('transcript', 'is', null)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (error) {
          if (error.code === 'PGRST116') { // No rows returned from the query
            setError('No se encontró ninguna transcripción para este número telefónico');
          } else {
            throw error;
          }
        } else if (data) {
          setTranscript(data.transcript);
        } else {
          setError('No se encontró ninguna transcripción para este número telefónico');
        }
      } catch (err: any) {
        console.error('Error fetching transcript:', err);
        setError(`Error al cargar la transcripción: ${err.message || 'Desconocido'}`);
      } finally {
        setLoading(false);
      }
    }

    fetchTranscript();
  }, [phoneNumber, leadId]);

  if (loading) {
    return (
      <Card className="bg-white shadow-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-sm text-muted-foreground">Cargando transcripción de la llamada...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-white shadow-sm">
        <CardContent className="pt-6">
          <Alert variant="warning">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white shadow-sm">
      <CardContent className="pt-6">
        <div className="flex items-center mb-4 gap-2 text-primary">
          <MessageCircle className="h-5 w-5" />
          <h3 className="font-medium">Transcripción de la llamada</h3>
        </div>

        {transcript ? (
          <ScrollArea className="h-[450px] pr-4">
            <div className="space-y-4 text-sm">
              {transcript.split('\n').map((line, idx) => {
                // Determine if this line is from the agent or customer
                const isSpeakerLine = line.trim().startsWith('Agent:') || line.trim().startsWith('Customer:');
                
                if (isSpeakerLine) {
                  const [speaker, ...rest] = line.split(':');
                  const content = rest.join(':').trim();
                  const isAgent = speaker.trim() === 'Agent';
                  
                  return (
                    <div key={idx} className={`flex ${isAgent ? 'justify-start' : 'justify-end'}`}>
                      <div 
                        className={`rounded-lg px-4 py-2 max-w-[80%] ${
                          isAgent 
                            ? 'bg-primary text-white' 
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        <p className="text-xs font-semibold mb-1">{speaker.trim()}</p>
                        <p>{content}</p>
                      </div>
                    </div>
                  );
                } else {
                  // This is likely a continuation or timestamp
                  return line.trim() ? <p key={idx} className="text-xs text-gray-500 text-center">{line}</p> : null;
                }
              })}
            </div>
          </ScrollArea>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            No se encontró ninguna transcripción para este número telefónico
          </div>
        )}
      </CardContent>
    </Card>
  );
};
