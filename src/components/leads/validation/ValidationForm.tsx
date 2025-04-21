
import React from 'react';
import { Form } from '@/components/ui/form';
import { Card, CardContent } from '@/components/ui/card';
import { ValidationFormData } from './types';
import { ValidationFormHeader } from './components/ValidationFormHeader';
import { CriticalRequirements } from './components/CriticalRequirements';
import { AdditionalRequirements } from './components/AdditionalRequirements';
import { CallEvaluation } from './components/CallEvaluation';
import { ValidationNotes } from './components/ValidationNotes';
import { FormActions } from './components/FormActions';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface ValidationFormProps {
  formData: ValidationFormData;
  onInputChange: (name: keyof ValidationFormData, value: any) => void;
  onSubmit: () => void;
  loading: boolean;
  leadName: string;
  hasTranscript: boolean;
  error?: string | null;
}

export const ValidationForm: React.FC<ValidationFormProps> = ({
  formData,
  onInputChange,
  onSubmit,
  loading,
  leadName,
  hasTranscript,
  error
}) => {
  // Check if all critical requirements are answered
  const isCriticalRequirementsMissing = 
    formData.age_requirement_met === null ||
    formData.interview_passed === null ||
    formData.background_check_passed === null;
  
  // Determine if the form is valid for submission
  const isFormValid = !isCriticalRequirementsMissing;

  // Check if there's an authentication error
  const isAuthError = error && (
    error.includes('sesión') || 
    error.includes('autenticación') || 
    error.includes('iniciar sesión') ||
    error.includes('usuario')
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid && !isAuthError) {
      onSubmit();
    }
  };

  return (
    <Card className="bg-white shadow-sm">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <ValidationFormHeader 
            leadName={leadName} 
            error={!isAuthError ? error : null} 
            hasTranscript={hasTranscript} 
          />
          
          <div className="grid sm:grid-cols-2 gap-6">
            <CriticalRequirements formData={formData} onInputChange={onInputChange} />
            <AdditionalRequirements formData={formData} onInputChange={onInputChange} />
          </div>
          
          <div className="border-t pt-4">
            <CallEvaluation formData={formData} onInputChange={onInputChange} />
          </div>
          
          <ValidationNotes formData={formData} onInputChange={onInputChange} />
          
          <FormActions 
            loading={loading} 
            isFormValid={isFormValid} 
            isCriticalRequirementsMissing={isCriticalRequirementsMissing}
            authError={isAuthError ? error : null}
          />
        </form>
      </CardContent>
    </Card>
  );
};
