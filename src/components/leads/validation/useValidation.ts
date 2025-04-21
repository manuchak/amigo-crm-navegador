
import { useState, useEffect } from 'react';
import { CustodioValidation, ValidationStats, ValidationFormData } from './types';
import { createValidation, updateValidation, getValidationByLeadId, getValidationStats } from '@/services/validationService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const useValidation = (leadId?: number) => {
  const [validation, setValidation] = useState<CustodioValidation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<ValidationStats[]>([]);
  const [statsLoading, setStatsLoading] = useState(false);
  const { toast: uiToast } = useToast();
  const { currentUser, userData } = useAuth(); // Access authentication context
  
  // Form state for validation
  const [formData, setFormData] = useState<ValidationFormData>({
    has_security_experience: null,
    has_military_background: null,
    has_vehicle: null,
    has_firearm_license: null,
    age_requirement_met: null,
    interview_passed: null,
    background_check_passed: null,
    call_quality_score: null,
    communication_score: null,
    reliability_score: null,
    rejection_reason: '',
    additional_notes: ''
  });
  
  // Verify authentication with special handling for owner role
  useEffect(() => {
    const checkSession = async () => {
      // Clear any previous error
      setError(null);
    
      try {
        // Check if there's a valid session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw new Error('Error al verificar la sesión: ' + sessionError.message);
        }
        
        if (!sessionData?.session) {
          throw new Error('No se detectó una sesión activa. Por favor inicie sesión nuevamente.');
        }
        
        // Check if we have a user
        if (!currentUser) {
          throw new Error('No se detectó un usuario activo. Por favor inicie sesión nuevamente.');
        }
        
        // Check if user is owner - owners should have all permissions
        if (userData?.role === 'owner') {
          console.log('Usuario con rol owner - acceso total concedido');
          // No error for owners - they should have all permissions
        }
      } catch (err: any) {
        console.error('Authentication error:', err);
        setError(err.message || 'Error de autenticación. Por favor inicie sesión nuevamente.');
      }
    };
    
    checkSession();
  }, [currentUser, userData]);
  
  // Load stats on initial render
  useEffect(() => {
    const fetchStats = async () => {
      if (!currentUser) return; // Don't fetch if not authenticated
      
      setStatsLoading(true);
      try {
        const statsData = await getValidationStats();
        setStats(statsData);
      } catch (error) {
        console.error('Error fetching validation stats:', error);
      } finally {
        setStatsLoading(false);
      }
    };
    
    fetchStats();
  }, [currentUser]);
  
  // Load existing validation when leadId changes
  useEffect(() => {
    if (!leadId) return;
    
    const fetchValidation = async () => {
      setLoading(true);
      setError(null);
      try {
        // If user is owner, proceed with validation access
        if (userData?.role === 'owner') {
          console.log('Owner accessing validation data - proceeding');
        }
        
        const existingValidation = await getValidationByLeadId(leadId);
        setValidation(existingValidation);
        
        // If validation exists, populate form data
        if (existingValidation) {
          setFormData({
            has_security_experience: existingValidation.has_security_experience,
            has_military_background: existingValidation.has_military_background,
            has_vehicle: existingValidation.has_vehicle,
            has_firearm_license: existingValidation.has_firearm_license,
            age_requirement_met: existingValidation.age_requirement_met,
            interview_passed: existingValidation.interview_passed,
            background_check_passed: existingValidation.background_check_passed,
            call_quality_score: existingValidation.call_quality_score,
            communication_score: existingValidation.communication_score,
            reliability_score: existingValidation.reliability_score,
            rejection_reason: existingValidation.rejection_reason || '',
            additional_notes: existingValidation.additional_notes || ''
          });
        } else {
          // Reset form data if no validation exists
          setFormData({
            has_security_experience: null,
            has_military_background: null,
            has_vehicle: null,
            has_firearm_license: null,
            age_requirement_met: null,
            interview_passed: null,
            background_check_passed: null,
            call_quality_score: null,
            communication_score: null,
            reliability_score: null,
            rejection_reason: '',
            additional_notes: ''
          });
        }
      } catch (error: any) {
        console.error('Error fetching validation:', error);
        // Special handling for owners - try again with a bypass
        if (userData?.role === 'owner') {
          console.log('Owner encountered error - attempting bypass');
          setError('Error al cargar la validación - intentando recuperación para rol propietario');
          
          // Try again with minimal permissions check
          try {
            const { data } = await supabase
              .from('custodio_validations')
              .select('*')
              .eq('lead_id', leadId)
              .maybeSingle();
            
            if (data) {
              setValidation(data as CustodioValidation);
              // Populate form data
              setFormData({
                has_security_experience: data.has_security_experience,
                has_military_background: data.has_military_background,
                has_vehicle: data.has_vehicle,
                has_firearm_license: data.has_firearm_license,
                age_requirement_met: data.age_requirement_met,
                interview_passed: data.interview_passed,
                background_check_passed: data.background_check_passed,
                call_quality_score: data.call_quality_score,
                communication_score: data.communication_score,
                reliability_score: data.reliability_score,
                rejection_reason: data.rejection_reason || '',
                additional_notes: data.additional_notes || ''
              });
              setError(null); // Clear error if recovery succeeded
            } else {
              // No validation found, but that's OK - just means we're creating a new one
              setError(null);
            }
          } catch (recoveryError) {
            console.error('Recovery attempt failed:', recoveryError);
            setError('Error al cargar la validación existente - intente nuevamente');
          }
        } else {
          // For non-owners, show the original error
          setError(error.message || 'Error al cargar la validación existente');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchValidation();
  }, [leadId, currentUser, userData]);
  
  // Handle form input changes
  const handleInputChange = (name: keyof ValidationFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Check authentication status with special handling for owners
  const checkAuthStatus = (): boolean => {
    if (!currentUser) {
      const errorMessage = 'Sesión no válida. Por favor inicie sesión nuevamente.';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    }
    
    // Special handling for owners - they should always have access
    if (userData?.role === 'owner') {
      console.log('Usuario con rol propietario - acceso total concedido');
      return true;
    }
    
    if (!userData) {
      const errorMessage = 'No se pudieron obtener los datos de usuario. Por favor inicie sesión nuevamente.';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    }
    
    return true;
  };
  
  // Save validation (create or update)
  const saveValidation = async (): Promise<CustodioValidation | null> => {
    if (!leadId) return null;
    
    // Verify authentication status with special handling for owner role
    if (!checkAuthStatus()) {
      // If user is owner, still allow operation despite auth check failure
      if (userData?.role === 'owner') {
        console.log('Permitiendo operación para propietario a pesar del fallo de autenticación');
        // Proceed with operation for owners
      } else {
        return null; // Block operation for non-owners
      }
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
      
      // Special error handling for owners
      if (userData?.role === 'owner') {
        // Attempt direct database access for owners as a fallback
        try {
          console.log('Intentando guardar directamente para usuario propietario');
          
          let result: CustodioValidation;
          
          if (validation) {
            // Direct update for owners
            const { data, error: updateError } = await supabase
              .from('custodio_validations')
              .update({
                ...formData,
                updated_at: new Date().toISOString()
              })
              .eq('id', validation.id)
              .select()
              .single();
              
            if (updateError) throw updateError;
            result = data as CustodioValidation;
          } else {
            // Direct insert for owners
            const validationData = {
              lead_id: leadId,
              ...formData,
              validation_date: new Date().toISOString(),
              status: formData.interview_passed === false || 
                     formData.background_check_passed === false || 
                     formData.age_requirement_met === false ? 'rejected' : 'approved',
              validated_by: currentUser.uid,
              lifetime_id: `CUS-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`
            };
            
            const { data, error: insertError } = await supabase
              .from('custodio_validations')
              .insert([validationData])
              .select()
              .single();
              
            if (insertError) throw insertError;
            result = data as CustodioValidation;
          }
          
          setValidation(result);
          toast.success('Validación guardada exitosamente (acceso propietario)');
          return result;
        } catch (ownerError: any) {
          console.error('Error en acceso directo para propietario:', ownerError);
          setError('Error al guardar la validación (acceso propietario): ' + ownerError.message);
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
    validation,
    formData,
    loading,
    error,
    stats,
    statsLoading,
    handleInputChange,
    saveValidation
  };
};
