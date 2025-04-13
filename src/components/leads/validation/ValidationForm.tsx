
import React from 'react';
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ValidationFormData } from './types';
import { Badge } from '@/components/ui/badge';
import { Loader2, Save, X, Check } from 'lucide-react';

interface ValidationFormProps {
  formData: ValidationFormData;
  onInputChange: (name: keyof ValidationFormData, value: any) => void;
  onSubmit: () => void;
  loading: boolean;
  leadName: string;
  hasTranscript: boolean;
}

export const ValidationForm: React.FC<ValidationFormProps> = ({
  formData,
  onInputChange,
  onSubmit,
  loading,
  leadName,
  hasTranscript
}) => {
  // Check if all critical requirements are answered
  const isCriticalRequirementsMissing = 
    formData.age_requirement_met === null ||
    formData.interview_passed === null ||
    formData.background_check_passed === null;
  
  // Determine if the form is valid for submission
  const isFormValid = !isCriticalRequirementsMissing;

  // Helper to render a tri-state checkbox (yes/no/unknown)
  const renderTriStateField = (
    label: string, 
    name: keyof ValidationFormData, 
    description?: string
  ) => {
    const value = formData[name];
    
    return (
      <FormItem className="space-y-2">
        <FormLabel className="flex justify-between items-center">
          {label}
          {value !== null && (
            <Badge 
              variant={value === true ? "success" : "destructive"} 
              className="ml-2"
            >
              {value === true ? "Sí" : "No"}
            </Badge>
          )}
        </FormLabel>
        <FormControl>
          <RadioGroup 
            className="flex space-x-4" 
            value={value === null ? undefined : value.toString()}
            onValueChange={(val) => onInputChange(name, val === "true")}
          >
            <div className="flex items-center space-x-1">
              <RadioGroupItem value="true" id={`${name}-yes`} />
              <label htmlFor={`${name}-yes`} className="text-sm font-normal">Sí</label>
            </div>
            <div className="flex items-center space-x-1">
              <RadioGroupItem value="false" id={`${name}-no`} />
              <label htmlFor={`${name}-no`} className="text-sm font-normal">No</label>
            </div>
          </RadioGroup>
        </FormControl>
        {description && <FormDescription>{description}</FormDescription>}
      </FormItem>
    );
  };
  
  // Helper to render a rating field (1-5)
  const renderRatingField = (
    label: string, 
    name: keyof ValidationFormData
  ) => {
    const value = formData[name] as number | null;
    
    return (
      <FormItem className="space-y-2">
        <FormLabel>{label}</FormLabel>
        <FormControl>
          <div className="flex space-x-3">
            {[1, 2, 3, 4, 5].map(rating => (
              <Button 
                key={rating}
                type="button"
                size="sm"
                variant={value === rating ? "default" : "outline"}
                onClick={() => onInputChange(name, rating)}
                className="w-9 h-9 p-0 rounded-full"
              >
                {rating}
              </Button>
            ))}
          </div>
        </FormControl>
      </FormItem>
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) {
      onSubmit();
    }
  };

  return (
    <Card className="bg-white shadow-sm">
      <CardContent className="pt-6">
        <Form>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Validación de Custodio: {leadName}</h3>
              {!hasTranscript && (
                <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded-md">
                  No se encontró transcripción de llamada para este custodio. Se recomienda realizar una llamada antes de validar.
                </div>
              )}
            </div>
            
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="text-sm font-medium text-muted-foreground">Requisitos Críticos</div>
                {renderTriStateField(
                  "Cumple con requisito de edad", 
                  "age_requirement_met", 
                  "El custodio debe tener entre 25 y 55 años"
                )}
                {renderTriStateField(
                  "Entrevista aprobada", 
                  "interview_passed",
                  "Basado en la llamada y transcripción"
                )}
                {renderTriStateField(
                  "Verificación de antecedentes aprobada", 
                  "background_check_passed"
                )}
              </div>
              
              <div className="space-y-4">
                <div className="text-sm font-medium text-muted-foreground">Requisitos Adicionales</div>
                {renderTriStateField("Tiene experiencia en seguridad", "has_security_experience")}
                {renderTriStateField("Tiene antecedentes militares", "has_military_background")}
                {renderTriStateField("Posee vehículo propio", "has_vehicle")}
                {renderTriStateField("Posee licencia de armas", "has_firearm_license")}
              </div>
            </div>
            
            <div className="border-t pt-4">
              <div className="text-sm font-medium text-muted-foreground mb-4">Evaluación de Llamada</div>
              
              <div className="grid sm:grid-cols-3 gap-4">
                {renderRatingField("Calidad de Llamada", "call_quality_score")}
                {renderRatingField("Comunicación", "communication_score")}
                {renderRatingField("Confiabilidad", "reliability_score")}
              </div>
            </div>
            
            <div className="space-y-4">
              <FormItem>
                <FormLabel>Notas Adicionales</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Observaciones sobre el custodio..."
                    value={formData.additional_notes}
                    onChange={(e) => onInputChange("additional_notes", e.target.value)}
                    rows={3}
                  />
                </FormControl>
              </FormItem>
              
              <FormItem>
                <FormLabel>Razón de Rechazo (si aplica)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Razón por la cual el custodio no cumple con los requisitos..."
                    value={formData.rejection_reason}
                    onChange={(e) => onInputChange("rejection_reason", e.target.value)}
                    rows={2}
                  />
                </FormControl>
              </FormItem>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button type="submit" disabled={loading || !isFormValid}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Guardar Validación
              </Button>
            </div>
            
            {isCriticalRequirementsMissing && (
              <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded-md">
                Por favor completa todos los requisitos críticos antes de guardar.
              </div>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
