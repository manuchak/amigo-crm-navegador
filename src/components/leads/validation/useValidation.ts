
import { useState, useEffect } from 'react';
import { CustodioValidation, ValidationStats, ValidationFormData } from './types';
import { createValidation, updateValidation, getValidationByLeadId, getValidationStats } from '@/services/validationService';

export const useValidation = (leadId?: number) => {
  const [validation, setValidation] = useState<CustodioValidation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<ValidationStats[]>([]);
  const [statsLoading, setStatsLoading] = useState(false);
  
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
  
  // Load stats on initial render
  useEffect(() => {
    const fetchStats = async () => {
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
  }, []);
  
  // Load existing validation when leadId changes
  useEffect(() => {
    if (!leadId) return;
    
    const fetchValidation = async () => {
      setLoading(true);
      setError(null);
      try {
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
      } catch (error) {
        console.error('Error fetching validation:', error);
        setError('Error al cargar la validación existente');
      } finally {
        setLoading(false);
      }
    };
    
    fetchValidation();
  }, [leadId]);
  
  // Handle form input changes
  const handleInputChange = (name: keyof ValidationFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Save validation (create or update)
  const saveValidation = async (): Promise<CustodioValidation | null> => {
    if (!leadId) return null;
    
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
      if (error.code === '42501') {
        setError('Error de permisos: No tiene permisos para guardar validaciones');
      } else {
        setError(error.message || 'Error al guardar la validación');
      }
      
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
