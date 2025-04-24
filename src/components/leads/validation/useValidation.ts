
import { useState } from 'react';
import { CustodioValidation, ValidationStats, ValidationFormData } from './types';

// Import modular hooks
import { useValidationAuth } from './hooks/useValidationAuth';
import { useValidationStats } from './hooks/useValidationStats';
import { useValidationForm } from './hooks/useValidationForm';
import { useSaveValidation } from './hooks/useSaveValidation';

export const useValidation = (leadId?: number) => {
  const [error, setError] = useState<string | null>(null);
  
  // Authentication hook
  const {
    currentUser,
    userData,
    isOwner,
    checkAuthStatus
  } = useValidationAuth();
  
  // Stats hook
  const { stats, statsLoading } = useValidationStats(currentUser, userData, setError);
  
  // Form state hook
  const {
    validation,
    formData,
    loading,
    handleInputChange,
    setFormData
  } = useValidationForm(leadId, currentUser, userData, setError);
  
  // Save validation hook - updated to pass the async checkAuthStatus function
  const { saveValidation } = useSaveValidation(
    leadId,
    validation,
    (val) => validation !== val ? val : validation, // Only update if different
    formData,
    (isLoading) => loading !== isLoading, // Only update if different
    setError,
    checkAuthStatus, // Now correctly typed as returning Promise<boolean>
    isOwner
  );
  
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
