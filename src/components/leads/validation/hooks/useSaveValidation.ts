
import { createValidation, updateValidation } from '@/services/validationService';
import { ValidationFormData, CustodioValidation } from '../types';
import { toast } from 'sonner';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook to handle saving validation data
 */
export const useSaveValidation = (
  leadId: number | undefined,
  validation: CustodioValidation | null,
  setValidation: (validation: CustodioValidation | null) => void,
  formData: ValidationFormData,
  setLoading: (loading: boolean) => void,
  setError: (error: string | null) => void,
  checkAuthStatus: () => boolean,
  isOwner: boolean
) => {
  const { toast: uiToast } = useToast();
  
  // Save validation (create or update)
  const saveValidation = async (): Promise<CustodioValidation | null> => {
    if (!leadId) return null;
    
    // For non-owners, verify authentication status
    if (!isOwner && !checkAuthStatus()) {
      return null;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      let result: CustodioValidation;
      
      if (validation) {
        // Update existing validation
        result = await updateValidation(validation.id, formData);
      } else {
        // Create new validation
        result = await createValidation(leadId, formData);
      }
      
      setValidation(result);
      return result;
    } catch (error: any) {
      console.error('Error saving validation:', error);
      
      // Set a friendly error message
      if (error.message) {
        setError(error.message);
      } else if (error.code === '22P02') {
        setError('Error de formato: Valor inválido para el tipo de dato');
      } else if (error.code === '42501') {
        setError('Error de permisos: No tiene permisos para guardar validaciones');
      } else {
        setError('Error al guardar la validación. Por favor intente nuevamente.');
      }
      
      // Show toast with error
      toast.error(error.message || 'Error al guardar la validación');
      uiToast({
        title: "Error",
        description: error.message || 'Error al guardar la validación',
        variant: "destructive",
      });
      
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  return {
    saveValidation
  };
};
