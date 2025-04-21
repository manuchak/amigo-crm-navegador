
import { supabase } from '@/integrations/supabase/client';
import { CustodioValidation, ValidationStats } from '@/components/leads/validation/types';

// Generate a unique lifetime ID for custodios
const generateLifetimeId = (): string => {
  // Format: CUS-YYYY-XXXXX (CUS prefix, year, and 5 random alphanumeric characters)
  const year = new Date().getFullYear();
  const randomChars = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `CUS-${year}-${randomChars}`;
};

// Verify session is valid with improved role checking for owners
const verifySession = async (): Promise<boolean> => {
  try {
    // Check if there's a valid Supabase session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session verification error:', sessionError);
      return false;
    }
    
    if (!sessionData?.session) {
      console.error('Session verification failed: No session data');
      return false;
    }
    
    // Verify the user exists in the session
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('User verification error:', userError);
      return false;
    }
    
    if (!userData?.user?.id) {
      console.error('User verification failed: No user data');
      return false;
    }
    
    // Check user role if needed - owners should have all permissions
    try {
      const { data: roleData } = await supabase.rpc('get_user_role', { 
        user_uid: userData.user.id 
      });
      
      // Log role for debugging
      console.log('User role from verification:', roleData);
      
      // If the user is an owner or admin, they should always pass verification
      if (roleData === 'owner' || roleData === 'admin') {
        console.log('User is owner/admin - permissions granted');
        return true;
      }
    } catch (roleError) {
      console.error('Role check error:', roleError);
      // Even if role check fails, we still have a valid session, so continue
    }
    
    return true;
  } catch (error) {
    console.error('Session verification error:', error);
    return false;
  }
};

// Get all validations
export const getValidations = async (): Promise<CustodioValidation[]> => {
  // Check session validity
  if (!(await verifySession())) {
    throw new Error('Sesión no válida. Por favor inicie sesión nuevamente.');
  }
  
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
  // Check session validity
  if (!(await verifySession())) {
    throw new Error('Sesión no válida. Por favor inicie sesión nuevamente.');
  }
  
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
  // Check session validity
  if (!(await verifySession())) {
    throw new Error('Sesión no válida. Por favor inicie sesión nuevamente.');
  }
  
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
    // Verify session validity
    if (!(await verifySession())) {
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
  } catch (error: any) {
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
    // Verify session validity
    if (!(await verifySession())) {
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
  } catch (error: any) {
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
