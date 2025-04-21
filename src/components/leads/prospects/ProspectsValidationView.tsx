
import React, { useState, useEffect } from 'react';
import { Prospect } from '@/services/prospectService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useValidation } from '@/components/leads/validation/useValidation';
import { ValidationForm } from '@/components/leads/validation/ValidationForm';
import { CallTranscript } from '@/components/leads/validation/CallTranscript';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatPhoneNumber } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useLeads } from '@/context/LeadsContext';

interface ProspectsValidationViewProps {
  prospect: Prospect;
  onBack: () => void;
  onComplete: () => void;
}

const ProspectsValidationView: React.FC<ProspectsValidationViewProps> = ({
  prospect,
  onBack,
  onComplete
}) => {
  const [activeTab, setActiveTab] = useState('form');
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean, status: 'approved' | 'rejected' }>({ 
    open: false, 
    status: 'approved' 
  });
  const { toast } = useToast();
  const { updateLeadStatus, refetchLeads } = useLeads();
  
  const {
    validation,
    formData,
    loading,
    handleInputChange,
    saveValidation
  } = useValidation(prospect.lead_id);

  const handleSaveValidation = async () => {
    const result = await saveValidation();
    if (result) {
      toast({
        title: "Datos guardados",
        description: "La validación ha sido guardada correctamente",
      });
    } else {
      toast({
        title: "Error",
        description: "No se pudo guardar la validación",
        variant: "destructive",
      });
    }
  };
  
  const handleApprove = async () => {
    setConfirmDialog({ open: true, status: 'approved' });
  };
  
  const handleReject = () => {
    setConfirmDialog({ open: true, status: 'rejected' });
  };
  
  const confirmStatusChange = async () => {
    try {
      // First save the validation data
      const result = await saveValidation();
      if (!result) {
        toast({
          title: "Error",
          description: "No se pudo guardar la validación",
          variant: "destructive",
        });
        return;
      }
      
      // Then update the lead status
      if (prospect.lead_id) {
        const newStatus = confirmDialog.status === 'approved' ? 'Calificado' : 'Rechazado';
        await updateLeadStatus(prospect.lead_id, newStatus);
        
        toast({
          title: confirmDialog.status === 'approved' ? "Custodio aprobado" : "Custodio rechazado",
          description: confirmDialog.status === 'approved' 
            ? "El custodio ha sido aprobado y pasado a la siguiente etapa" 
            : "El custodio ha sido marcado como rechazado",
        });
        
        // Refresh leads data
        await refetchLeads();
        
        // Close dialog and return to list
        setConfirmDialog({ ...confirmDialog, open: false });
        onComplete();
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del custodio",
        variant: "destructive",
      });
    }
  };

  // Determine if critical criteria are met
  const isCriticalCriteriaMet = 
    formData.age_requirement_met === true && 
    formData.interview_passed === true && 
    formData.background_check_passed === true;
  
  // Check if all required fields are filled
  const isFormComplete = 
    formData.age_requirement_met !== null &&
    formData.interview_passed !== null &&
    formData.background_check_passed !== null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-0">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">Validación de Custodio: {prospect.lead_name || prospect.custodio_name}</CardTitle>
            <p className="text-sm text-slate-500">
              {formatPhoneNumber(prospect.lead_phone || prospect.phone_number_intl || "")}
            </p>
          </div>
        </CardHeader>
        
        <CardContent className="pt-4">
          {!isFormComplete && validation === null && (
            <Alert className="mb-4">
              <Info className="h-4 w-4" />
              <AlertTitle>Validación inicial</AlertTitle>
              <AlertDescription>
                Complete el formulario de validación para determinar si el custodio cumple con los requisitos.
                Revise la transcripción de la entrevista para obtener información relevante.
              </AlertDescription>
            </Alert>
          )}
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="form">Formulario de Validación</TabsTrigger>
              <TabsTrigger value="transcript">Transcripción de Entrevista</TabsTrigger>
            </TabsList>
            
            <TabsContent value="form" className="mt-0">
              <ValidationForm
                formData={formData}
                onInputChange={handleInputChange}
                onSubmit={handleSaveValidation}
                loading={loading}
                leadName={prospect.lead_name || prospect.custodio_name || 'Prospecto'}
                hasTranscript={prospect.transcript !== null}
              />
            </TabsContent>
            
            <TabsContent value="transcript" className="mt-0">
              <CallTranscript 
                leadId={prospect.lead_id || 0}
                phoneNumber={prospect.lead_phone || prospect.phone_number_intl} 
              />
            </TabsContent>
          </Tabs>
        </CardContent>
        
        <CardFooter className="border-t pt-4 flex justify-between">
          <Button variant="outline" onClick={onBack}>
            Cancelar
          </Button>
          
          <div className="space-x-2">
            <Button 
              variant="outline" 
              onClick={handleReject}
              className="bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
            >
              Rechazar custodio
            </Button>
            
            <Button 
              onClick={handleApprove}
              disabled={!isFormComplete || !isCriticalCriteriaMet}
            >
              Aprobar custodio
            </Button>
          </div>
        </CardFooter>
      </Card>
      
      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmDialog.status === 'approved' ? 'Confirmar aprobación' : 'Confirmar rechazo'}
            </DialogTitle>
            <DialogDescription>
              {confirmDialog.status === 'approved' 
                ? '¿Está seguro de aprobar este custodio? El custodio será marcado como calificado y pasará a la siguiente etapa del proceso.'
                : '¿Está seguro de rechazar este custodio? El custodio será marcado como rechazado.'}
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter className="flex space-x-2 justify-end">
            <Button variant="outline" onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}>
              Cancelar
            </Button>
            <Button 
              onClick={confirmStatusChange}
              variant={confirmDialog.status === 'approved' ? 'default' : 'destructive'}
            >
              {confirmDialog.status === 'approved' ? 'Aprobar' : 'Rechazar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProspectsValidationView;
