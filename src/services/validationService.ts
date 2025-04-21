
import { supabase } from '@/integrations/supabase/client';
import { CustodioValidation, ValidationStats } from '@/components/leads/validation/types';

// Get all validations
export const getValidations = async (): Promise<CustodioValidation[]> => {
  const { data, error } = await supabase
    .from('custodio_validations')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching validations:', error);
    throw error;
  }
  
  return data as CustodioValidation[];
};

// Get validation stats
export const getValidationStats = async (): Promise<ValidationStats[]> => {
  const { data, error } = await supabase
    .from('custodio_validation_stats')
    .select('*')
    .limit(30);
  
  if (error) {
    console.error('Error fetching validation stats:', error);
    throw error;
  }
  
  return data as ValidationStats[];
};

// Get validation by lead ID
export const getValidationByLeadId = async (leadId: number): Promise<CustodioValidation | null> => {
  const { data, error } = await supabase
    .from('custodio_validations')
    .select('*')
    .eq('lead_id', leadId)
    .maybeSingle();
  
  if (error) {
    console.error('Error fetching validation by lead ID:', error);
    throw error;
  }
  
  return data as CustodioValidation | null;
};

// Create a new validation
export const createValidation = async (
  leadId: number, 
  formData: any
): Promise<CustodioValidation> => {
  const startTime = new Date();
  
  try {
    const validationData = {
      lead_id: leadId,
      ...formData,
      validation_date: new Date().toISOString(),
      status: determineValidationStatus(formData),
      validated_by: supabase.auth.getUser().then(res => res.data.user?.id) // Get current user ID
    };
    
    const { data, error } = await supabase
      .from('custodio_validations')
      .insert([validationData])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating validation:', error);
      throw error;
    }
    
    // Calculate duration
    const endTime = new Date();
    const durationSeconds = Math.round((endTime.getTime() - startTime.getTime()) / 1000);
    
    // Update with duration
    await supabase
      .from('custodio_validations')
      .update({ validation_duration_seconds: durationSeconds })
      .eq('id', data.id);
    
    return data as CustodioValidation;
  } catch (error) {
    console.error('Error creating validation:', error);
    throw error;
  }
};

// Update an existing validation
export const updateValidation = async (
  id: string,
  formData: any
): Promise<CustodioValidation> => {
  const updatedData = {
    ...formData,
    status: determineValidationStatus(formData),
    updated_at: new Date().toISOString()
  };
  
  try {
    const { data, error } = await supabase
      .from('custodio_validations')
      .update(updatedData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating validation:', error);
      throw error;
    }
    
    return data as CustodioValidation;
  } catch (error) {
    console.error('Error updating validation:', error);
    throw error;
  }
};

// Helper function to determine validation status based on criteria
const determineValidationStatus = (formData: any): 'approved' | 'rejected' => {
  // Critical requirements for approval
  const criticalRequirements = [
    formData.interview_passed,
    formData.background_check_passed,
    formData.age_requirement_met
  ];
  
  // If any critical requirement is explicitly false, reject
  if (criticalRequirements.some(req => req === false)) {
    return 'rejected';
  }
  
  // If all critical requirements are true, approve
  if (criticalRequirements.every(req => req === true)) {
    return 'approved';
  }
  
  // Default to rejected if uncertain
  return 'rejected';
};
