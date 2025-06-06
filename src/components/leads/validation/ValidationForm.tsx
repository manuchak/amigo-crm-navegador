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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, InfoIcon, Loader2, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/auth';

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
  const { userData } = useAuth();
  const isOwner = userData?.role === 'owner';
  
  // Check if all critical requirements are answered
  const isCriticalRequirementsMissing = 
    formData.age_requirement_met === null ||
    formData.interview_passed === null ||
    formData.background_check_passed === null;
  
  // Determine if the form is valid for submission
  // For owners, we always allow submission
  const isFormValid = isOwner ? true : !isCriticalRequirementsMissing;

  // Check if there's an authentication error
  const isAuthError = error && (
    error.includes('sesión') || 
    error.includes('autenticación') || 
    error.includes('iniciar sesión') ||
    error.includes('usuario')
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isOwner || (isFormValid && !isAuthError)) {
      onSubmit();
    }
  };

  // If we're in a loading state initially, show a loading indicator
  if (loading && Object.values(formData).every(value => value === null || value === '')) {
    return (
      <Card className="bg-white shadow-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-sm text-muted-foreground">Cargando datos de validación...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white shadow-sm">
      <CardContent className="pt-6">
        {isOwner && (
          <Alert variant="info" className="mb-4 bg-blue-50 border-blue-200">
            <ShieldCheck className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-700">Modo propietario activo</AlertTitle>
            <AlertDescription className="text-blue-600">
              Como propietario, puede guardar validaciones y validar custodios sin restricciones.
            </AlertDescription>
          </Alert>
        )}
        
        {error && !isAuthError && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <ValidationFormHeader 
            leadName={leadName} 
            error={null} 
            hasTranscript={hasTranscript} 
          />
          
          <div className="grid sm:grid-cols-2 gap-6">
            <CriticalRequirements 
              formData={formData} 
              onInputChange={onInputChange}
              disabled={loading || isAuthError} 
            />
            <AdditionalRequirements 
              formData={formData} 
              onInputChange={onInputChange}
              disabled={loading || isAuthError}
            />
          </div>
          
          <div className="border-t pt-4">
            <CallEvaluation 
              formData={formData} 
              onInputChange={onInputChange}
              disabled={loading || isAuthError}
            />
          </div>
          
          <ValidationNotes 
            formData={formData} 
            onInputChange={onInputChange}
            disabled={loading || isAuthError}
          />
          
          <FormActions 
            loading={loading} 
            isFormValid={isFormValid} 
            isCriticalRequirementsMissing={isCriticalRequirementsMissing}
            authError={isAuthError ? error : null}
            isOwner={isOwner}
          />
        </form>
      </CardContent>
    </Card>
  );
};
