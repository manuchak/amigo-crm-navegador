
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getValidationByLeadId, createValidation, updateValidation, getValidationStats } from '@/services/validationService';
import { CustodioValidation, ValidationStats, ValidationFormData } from './types';

const initialFormData: ValidationFormData = {
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
};

export const useValidation = (leadId?: number) => {
  const [validation, setValidation] = useState<CustodioValidation | null>(null);
  const [formData, setFormData] = useState<ValidationFormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<ValidationStats[]>([]);
  const [statsLoading, setStatsLoading] = useState(false);
  const { toast } = useToast();

  // Fetch validation if lead ID is provided
  useEffect(() => {
    if (leadId) {
      fetchValidation(leadId);
    }
  }, [leadId]);

  // Fetch validation stats
  useEffect(() => {
    fetchValidationStats();
  }, []);

  const fetchValidation = async (id: number) => {
    try {
      setLoading(true);
      const data = await getValidationByLeadId(id);
      
      if (data) {
        setValidation(data);
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
      } else {
        setFormData(initialFormData);
      }
    } catch (error) {
      console.error('Error fetching validation:', error);
      toast({
        title: 'Error',
        description: 'No se pudo cargar la validación',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchValidationStats = async () => {
    try {
      setStatsLoading(true);
      const data = await getValidationStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching validation stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleInputChange = (name: keyof ValidationFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const saveValidation = async () => {
    if (!leadId) return;
    
    try {
      setLoading(true);
      let result;
      
      if (validation) {
        // Update existing validation
        result = await updateValidation(validation.id, formData);
        toast({
          title: 'Validación actualizada',
          description: `Estado: ${result.status === 'approved' ? 'Aprobado' : 'Rechazado'}`,
        });
      } else {
        // Create new validation
        result = await createValidation(leadId, formData);
        toast({
          title: 'Validación guardada',
          description: `Estado: ${result.status === 'approved' ? 'Aprobado' : 'Rechazado'}`,
        });
      }
      
      setValidation(result);
      
      // Refresh validation stats
      fetchValidationStats();
      
      return result;
    } catch (error) {
      console.error('Error saving validation:', error);
      toast({
        title: 'Error',
        description: 'No se pudo guardar la validación',
        variant: 'destructive',
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
    stats,
    statsLoading,
    handleInputChange,
    saveValidation,
    fetchValidation
  };
};
