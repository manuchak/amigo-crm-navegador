
import { supabase } from '@/integrations/supabase/client';
import { CustodioValidation, ValidationStats } from '@/components/leads/validation/types';

// Generate a unique lifetime ID for custodios
const generateLifetimeId = (): string => {
  // Format: CUS-YYYY-XXXXX (CUS prefix, year, and 5 random alphanumeric characters)
  const year = new Date().getFullYear();
  const randomChars = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `CUS-${year}-${randomChars}`;
};

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
    // Verificar que la sesión de usuario sea válida antes de continuar
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Error getting user session:', sessionError);
      throw new Error('No se pudo obtener la sesión del usuario. Por favor inicie sesión nuevamente.');
    }
    
    if (!sessionData?.session) {
      throw new Error('Sesión no válida. Por favor inicie sesión nuevamente.');
    }
    
    // Get current user with valid session
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('Error getting current user:', userError);
      throw new Error('No se pudo obtener el usuario actual. Por favor inicie sesión nuevamente.');
    }
    
    if (!userData?.user?.id) {
      throw new Error('Usuario no autenticado. Por favor inicie sesión nuevamente.');
    }
    
    // Generate a lifetime ID for the custodio
    const lifetimeId = generateLifetimeId();
    
    const validationData = {
      lead_id: leadId,
      ...formData,
      validation_date: new Date().toISOString(),
      status: determineValidationStatus(formData),
      validated_by: userData.user.id, // Use the actual user ID
      lifetime_id: lifetimeId // Add the lifetime ID
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
  try {
    // Verificar que la sesión de usuario sea válida antes de continuar
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Error getting user session:', sessionError);
      throw new Error('No se pudo obtener la sesión del usuario. Por favor inicie sesión nuevamente.');
    }
    
    if (!sessionData?.session) {
      throw new Error('Sesión no válida. Por favor inicie sesión nuevamente.');
    }
    
    const updatedData = {
      ...formData,
      status: determineValidationStatus(formData),
      updated_at: new Date().toISOString()
    };
    
    // Check if the validation already has a lifetime ID
    const { data: existingData, error: fetchError } = await supabase
      .from('custodio_validations')
      .select('lifetime_id')
      .eq('id', id)
      .maybeSingle();
    
    if (fetchError) {
      console.error('Error fetching existing validation:', fetchError);
      throw fetchError;
    }
    
    // If no lifetime ID exists, generate one and include it in the update
    if (existingData && !existingData.lifetime_id) {
      updatedData.lifetime_id = generateLifetimeId();
    }
    
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
