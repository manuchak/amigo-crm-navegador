
import { useState } from 'react';
import { Prospect } from '@/services/prospectService';
import { useValidation } from '@/components/leads/validation/useValidation';
import { useToast } from '@/hooks/use-toast';
import { useLeads } from '@/context/LeadsContext';
import { useAuth } from '@/context/AuthContext';

export const useValidationFlow = (
  prospect: Prospect,
  onComplete: () => void
) => {
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean, status: 'approved' | 'rejected' }>({ 
    open: false, 
    status: 'approved' 
  });
  
  const [successDialog, setSuccessDialog] = useState<{ open: boolean, status: 'approved' | 'rejected', lifetime_id?: string }>({ 
    open: false, 
    status: 'approved'
  });
  
  const { toast } = useToast();
  const { updateLeadStatus, refetchLeads } = useLeads();
  const { userData } = useAuth();
  const isOwner = userData?.role === 'owner';
  
  const {
    validation,
    formData,
    loading,
    error,
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
      
      if (result.lifetime_id) {
        toast({
          title: "ID Permanente Generado",
          description: `Identificador único: ${result.lifetime_id}`,
          variant: "default",
        });
      }
      
      // Update status to "Validado" when validation is successfully saved
      if (prospect.lead_id) {
        await updateLeadStatus(prospect.lead_id, "Validado");
        await refetchLeads();
      }
    } else {
      // Special handling for owners when save fails
      if (isOwner && error) {
        toast({
          title: "Advertencia",
          description: "Error detectado pero se intentará continuar con privilegios de propietario",
          variant: "warning",
        });
      } else {
        toast({
          title: "Error",
          description: error || "No se pudo guardar la validación",
          variant: "destructive",
        });
      }
    }
  };
  
  const handleApprove = () => {
    setConfirmDialog({ open: true, status: 'approved' });
  };
  
  const handleReject = () => {
    setConfirmDialog({ open: true, status: 'rejected' });
  };
  
  const confirmStatusChange = async () => {
    try {
      // For owners, force the status in the form data before saving
      if (isOwner) {
        // Add the forced status to formData
        handleInputChange('forced_status', confirmDialog.status);
      }
      
      const result = await saveValidation();
      
      if (!result) {
        // Special handling for owners
        if (isOwner) {
          toast({
            title: "Advertencia",
            description: "Error detectado pero se continúa con privilegios de propietario",
            variant: "warning",
          });
          
          // For owners, even if validation fails, we will update the lead status
          if (prospect.lead_id) {
            const newStatus = confirmDialog.status === 'approved' ? 'Validado' : 'Rechazado';
            await updateLeadStatus(prospect.lead_id, newStatus);
            
            setSuccessDialog({ 
              open: true, 
              status: confirmDialog.status,
              lifetime_id: undefined
            });
            
            setConfirmDialog({ ...confirmDialog, open: false });
            await refetchLeads();
            return;
          }
        } else {
          toast({
            title: "Error",
            description: error || "No se pudo guardar la validación",
            variant: "destructive",
          });
          return;
        }
      }
      
      if (prospect.lead_id) {
        // When approved, change status to "Validado" instead of "Calificado"
        const newStatus = confirmDialog.status === 'approved' ? 'Validado' : 'Rechazado';
        await updateLeadStatus(prospect.lead_id, newStatus);
        
        setSuccessDialog({ 
          open: true, 
          status: confirmDialog.status,
          lifetime_id: result?.lifetime_id || undefined
        });
        
        setConfirmDialog({ ...confirmDialog, open: false });
        
        await refetchLeads();
      }
    } catch (err) {
      console.error("Error updating status:", err);
      
      // Special handling for owners
      if (isOwner) {
        toast({
          title: "Advertencia",
          description: "Error detectado pero se continúa con privilegios de propietario",
          variant: "warning",
        });
        
        if (prospect.lead_id) {
          const newStatus = confirmDialog.status === 'approved' ? 'Validado' : 'Rechazado';
          await updateLeadStatus(prospect.lead_id, newStatus);
          setConfirmDialog({ ...confirmDialog, open: false });
          setSuccessDialog({ 
            open: true, 
            status: confirmDialog.status
          });
        }
      } else {
        toast({
          title: "Error",
          description: "No se pudo actualizar el estado del custodio",
          variant: "destructive",
        });
      }
    }
  };

  const handleComplete = () => {
    setSuccessDialog({ ...successDialog, open: false });
    onComplete();
  };

  // Determine if critical criteria are met and form is complete
  const isCriticalCriteriaMet = 
    formData.age_requirement_met === true && 
    formData.interview_passed === true && 
    formData.background_check_passed === true;
  
  // For owners, always consider the form complete enough to proceed
  const isFormComplete = isOwner ? true : (
    formData.age_requirement_met !== null &&
    formData.interview_passed !== null &&
    formData.background_check_passed !== null
  );

  return {
    validation,
    formData,
    confirmDialog,
    successDialog,
    loading,
    error,
    isFormComplete,
    isCriticalCriteriaMet,
    handleInputChange,
    handleSaveValidation,
    handleApprove,
    handleReject,
    setConfirmDialog,
    setSuccessDialog,
    confirmStatusChange,
    handleComplete
  };
};
