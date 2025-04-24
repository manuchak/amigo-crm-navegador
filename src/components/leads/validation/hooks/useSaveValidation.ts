
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
  // Updated type to match the async function
  checkAuthStatus: () => Promise<boolean>,
  isOwner: boolean
) => {
  const { toast: uiToast } = useToast();
  
  // Save validation (create or update)
  const saveValidation = async (): Promise<CustodioValidation | null> => {
    if (!leadId) return null;
    
    // For non-owners, verify authentication status
    // Owners can bypass standard auth check
    if (!isOwner) {
      // Updated to await the promise
      const isAuthenticated = await checkAuthStatus();
      if (!isAuthenticated) {
        setError("Se requiere autenticación para guardar validaciones.");
        toast.error("Sesión no válida. Por favor inicie sesión nuevamente.");
        return null;
      }
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log(`Attempting to save validation as ${isOwner ? 'owner' : 'regular user'}`);
      
      // Add owner flag to formData for the backend to see
      const enhancedFormData = {
        ...formData,
        _isOwnerOverride: isOwner
      };
      
      let result: CustodioValidation;
      
      if (validation) {
        // Update existing validation
        result = await updateValidation(validation.id, enhancedFormData);
      } else {
        // Create new validation
        result = await createValidation(leadId, enhancedFormData);
      }
      
      if (result) {
        console.log("Validation saved successfully:", result);
        setValidation(result);
      }
      
      return result;
    } catch (error: any) {
      console.error('Error saving validation:', error);
      
      // Special handling for owners to try to recover from errors
      if (isOwner) {
        console.log("Owner user encountered error, attempting recovery...");
        try {
          // For owners, make one more attempt with a stripped-down essential payload
          const essentialData = {
            ...formData,
            _isOwnerOverride: true,
            _emergencyOwnerBypass: true
          };
          
          console.log("Attempting emergency owner bypass with:", essentialData);
          
          let recoveryResult: CustodioValidation;
          
          if (validation) {
            recoveryResult = await updateValidation(validation.id, essentialData);
          } else {
            recoveryResult = await createValidation(leadId, essentialData);
          }
          
          console.log("Recovery attempt succeeded:", recoveryResult);
          setValidation(recoveryResult);
          
          // Show a warning but allow continuing
          uiToast({
            title: "Advertencia",
            description: "Se detectaron errores pero se completó la operación con privilegios de propietario",
            // Fix: Change "warning" to appropriate variant
            variant: "default",
          });
          
          return recoveryResult;
        } catch (recoveryError) {
          console.error("Owner recovery attempt failed:", recoveryError);
        }
      }
      
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
