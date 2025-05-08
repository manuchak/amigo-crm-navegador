
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
import { Loader2, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/auth'; // Updated import path
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Info } from 'lucide-react';

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
  const [transcriptError, setTranscriptError] = useState<string | null>(null);
  const { currentUser, userData } = useAuth();
  const isOwner = userData?.role === 'owner';
  
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
        setTranscriptError(null);
        
        // Owner users bypass transcript validation checks
        if (isOwner) {
          console.log("Owner user detected - bypassing transcript validation checks");
          setCheckingTranscript(false);
          return;
        }
        
        // Check for session validity first
        const { data: session, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session.session) {
          throw new Error('Sesión no válida para verificar transcripción. Por favor inicie sesión nuevamente.');
        }

        const { count, error } = await supabase
          .from('vapi_call_logs')
          .select('id', { count: 'exact', head: true })
          .or(`phone_number.eq.${leadPhone},caller_phone_number.eq.${leadPhone}`)
          .not('transcript', 'is', null);
          
        if (error) throw error;
        
        setHasTranscript(count ? count > 0 : false);
      } catch (error: any) {
        console.error('Error checking transcript:', error);
        setTranscriptError(error.message || 'Error al verificar la transcripción');
        setHasTranscript(false);
      } finally {
        setCheckingTranscript(false);
      }
    };
    
    checkTranscript();
  }, [open, leadPhone, isOwner]);

  const handleSubmit = async () => {
    // For owners, always proceed with validation regardless of auth state
    if (!currentUser && !isOwner) {
      return; // Don't attempt submission if not authenticated and not owner
    }
    
    const result = await saveValidation();
    if (result) {
      onValidationComplete(result.status as 'approved' | 'rejected');
    }
  };

  // Check if there's an authentication error
  const authError = !isOwner && (!currentUser || (error && (
    error.includes('sesión') || 
    error.includes('autenticación') || 
    error.includes('iniciar sesión')
  )));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Validación de Custodio</DialogTitle>
          <DialogDescription>
            Revisa la información y completa la validación para determinar si el custodio cumple con los requisitos.
          </DialogDescription>
        </DialogHeader>
        
        {/* Owner mode indicator */}
        {isOwner && (
          <Alert variant="info" className="mb-4 bg-blue-50 border-blue-200">
            <ShieldCheck className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-700">Modo propietario activo</AlertTitle>
            <AlertDescription className="text-blue-600">
              Acceso total a validaciones concedido como propietario del sistema.
            </AlertDescription>
          </Alert>
        )}
        
        {/* Authentication error alert - only show for non-owners */}
        {authError && !isOwner && (
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
              <TabsTrigger value="transcript" disabled={!hasTranscript && !isOwner}>
                Transcripción de Llamada
                {!hasTranscript && !isOwner && <span className="ml-2 text-xs">(No disponible)</span>}
              </TabsTrigger>
            </TabsList>
            
            {transcriptError && !isOwner && (
              <Alert variant="warning" className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{transcriptError}</AlertDescription>
              </Alert>
            )}
            
            <TabsContent value="form" className="mt-0">
              <ValidationForm
                formData={formData}
                onInputChange={handleInputChange}
                onSubmit={handleSubmit}
                loading={loading}
                leadName={leadName}
                hasTranscript={hasTranscript || isOwner}
                error={isOwner ? null : error}
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
