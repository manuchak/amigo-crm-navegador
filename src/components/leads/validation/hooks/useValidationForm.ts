
import { useState, useEffect } from 'react';
import { ValidationFormData, CustodioValidation } from '../types';
import { getValidationByLeadId } from '@/services/validationService';
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/types/auth';

/**
 * Hook to manage validation form state and operations
 */
export const useValidationForm = (
  leadId: number | undefined,
  currentUser: any,
  userData: any,
  setError: (error: string | null) => void
) => {
  const [validation, setValidation] = useState<CustodioValidation | null>(null);
  const [loading, setLoading] = useState(false);
  
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
  
  // Load existing validation when leadId changes
  useEffect(() => {
    if (!leadId) return;
    
    const fetchValidation = async () => {
      setLoading(true);
      setError(null);
      try {
        // If user is owner, proceed with validation access
        if (userData?.role === 'owner' as UserRole) {
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
        if (userData?.role === 'owner' as UserRole) {
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
  }, [leadId, currentUser, userData, setError]);
  
  // Handle form input changes
  const handleInputChange = (name: keyof ValidationFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return {
    validation,
    formData,
    loading,
    handleInputChange,
    setFormData
  };
};
