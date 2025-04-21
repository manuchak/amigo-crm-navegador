
import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ValidationForm } from '@/components/leads/validation/ValidationForm';
import { CallTranscript } from '@/components/leads/validation/CallTranscript';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, AlertTriangle } from 'lucide-react';
import { formatPhoneNumber } from '@/lib/utils';
import { Prospect } from '@/services/prospectService';
import { ValidationFormData } from '@/components/leads/validation/types';

interface ValidationContentProps {
  prospect: Prospect;
  formData: ValidationFormData;
  loading: boolean;
  error: string | null;
  handleInputChange: (name: keyof ValidationFormData, value: any) => void;
  handleSaveValidation: () => Promise<void>;
  handleApprove: () => void;
  handleReject: () => void;
  onBack: () => void;
  isFormComplete: boolean;
  isCriticalCriteriaMet: boolean;
}

export const ValidationContent: React.FC<ValidationContentProps> = ({
  prospect,
  formData,
  loading,
  error,
  handleInputChange,
  handleSaveValidation,
  handleApprove,
  handleReject,
  onBack,
  isFormComplete,
  isCriticalCriteriaMet
}) => {
  const [activeTab, setActiveTab] = useState('form');
  
  return (
    <Card>
      <CardHeader className="pb-0">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Validación de Custodio: {prospect.lead_name || prospect.custodio_name}</CardTitle>
          <p className="text-sm text-slate-500">
            {formatPhoneNumber(prospect.lead_phone || prospect.phone_number_intl || "")}
          </p>
        </div>
      </CardHeader>
      
      <CardContent className="pt-4">
        {error && (
          <Alert className="mb-4" variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}
        
        {!isFormComplete && !error && (
          <Alert className="mb-4">
            <Info className="h-4 w-4" />
            <AlertTitle>Validación inicial</AlertTitle>
            <AlertDescription>
              Complete el formulario de validación para determinar si el custodio cumple con los requisitos.
              Revise la transcripción de la entrevista para obtener información relevante.
            </AlertDescription>
          </Alert>
        )}
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="form">Formulario de Validación</TabsTrigger>
            <TabsTrigger value="transcript">Transcripción de Entrevista</TabsTrigger>
          </TabsList>
          
          <TabsContent value="form" className="mt-0">
            <ValidationForm
              formData={formData}
              onInputChange={handleInputChange}
              onSubmit={handleSaveValidation}
              loading={loading}
              leadName={prospect.lead_name || prospect.custodio_name || 'Prospecto'}
              hasTranscript={prospect.transcript !== null}
              error={error}
            />
          </TabsContent>
          
          <TabsContent value="transcript" className="mt-0">
            <CallTranscript 
              leadId={prospect.lead_id || 0}
              phoneNumber={prospect.lead_phone || prospect.phone_number_intl} 
            />
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="border-t pt-4 flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Cancelar
        </Button>
        
        <div className="space-x-2">
          <Button 
            variant="outline" 
            onClick={handleReject}
            className="bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
          >
            Rechazar custodio
          </Button>
          
          <Button 
            onClick={handleApprove}
            disabled={loading || !isFormComplete || !isCriticalCriteriaMet}
          >
            Aprobar custodio
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
