
import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { useValidation } from './useValidation';
import { ValidationForm } from './ValidationForm';
import { CallTranscript } from './CallTranscript';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface ValidationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leadId: number;
  leadName: string;
  leadPhone: string | undefined;
  onValidationComplete: (status: 'approved' | 'rejected') => void;
}

export const ValidationDialog: React.FC<ValidationDialogProps> = ({
  open,
  onOpenChange,
  leadId,
  leadName,
  leadPhone,
  onValidationComplete
}) => {
  const [activeTab, setActiveTab] = useState('form');
  const [hasTranscript, setHasTranscript] = useState(false);
  const [checkingTranscript, setCheckingTranscript] = useState(true);
  const { currentUser } = useAuth();
  
  const {
    validation,
    formData,
    loading,
    error,
    handleInputChange,
    saveValidation
  } = useValidation(open ? leadId : undefined);

  // Check if there's a transcript for this lead
  useEffect(() => {
    const checkTranscript = async () => {
      if (!open || !leadPhone) {
        setHasTranscript(false);
        setCheckingTranscript(false);
        return;
      }
      
      try {
        setCheckingTranscript(true);
        
        const { count, error } = await supabase
          .from('vapi_call_logs')
          .select('id', { count: 'exact', head: true })
          .or(`phone_number.eq.${leadPhone},caller_phone_number.eq.${leadPhone}`)
          .not('transcript', 'is', null);
          
        if (error) throw error;
        
        setHasTranscript(count ? count > 0 : false);
      } catch (error) {
        console.error('Error checking transcript:', error);
        setHasTranscript(false);
      } finally {
        setCheckingTranscript(false);
      }
    };
    
    checkTranscript();
  }, [open, leadPhone]);

  const handleSubmit = async () => {
    if (!currentUser) {
      return; // Don't attempt submission if not authenticated
    }
    
    const result = await saveValidation();
    if (result) {
      onValidationComplete(result.status as 'approved' | 'rejected');
    }
  };

  // Check if there's an authentication error
  const authError = !currentUser || (error && (
    error.includes('sesión') || 
    error.includes('autenticación') || 
    error.includes('iniciar sesión')
  ));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Validación de Custodio</DialogTitle>
          <DialogDescription>
            Revisa la información y completa la validación para determinar si el custodio cumple con los requisitos.
          </DialogDescription>
        </DialogHeader>
        
        {/* Authentication error alert */}
        {authError && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {error || 'Sesión no válida. Por favor inicie sesión nuevamente.'}
            </AlertDescription>
          </Alert>
        )}
        
        {checkingTranscript ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="form">Formulario de Validación</TabsTrigger>
              <TabsTrigger value="transcript" disabled={!hasTranscript}>
                Transcripción de Llamada
                {!hasTranscript && <span className="ml-2 text-xs">(No disponible)</span>}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="form" className="mt-0">
              <ValidationForm
                formData={formData}
                onInputChange={handleInputChange}
                onSubmit={handleSubmit}
                loading={loading}
                leadName={leadName}
                hasTranscript={hasTranscript}
                error={error}
              />
            </TabsContent>
            
            <TabsContent value="transcript" className="mt-0">
              <CallTranscript leadId={leadId} phoneNumber={leadPhone || null} />
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
};
