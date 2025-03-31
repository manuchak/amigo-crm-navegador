
import React from 'react';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { 
  FormLayout, 
  ContactSection, 
  QualificationsSection,
  useLeadForm 
} from './lead-form';
import { Save } from 'lucide-react';

const LeadCreationForm = () => {
  const { form, onSubmit } = useLeadForm();
  
  return (
    <FormLayout 
      title="Registro de Nuevo Custodio" 
      description="Ingresa los datos del candidato a custodio"
    >
      <Form {...form}>
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ContactSection />
            <QualificationsSection />
          </div>
          
          <Button type="submit" className="w-full">
            <Save className="mr-2 h-4 w-4" />
            Registrar custodio
          </Button>
        </form>
      </Form>
    </FormLayout>
  );
};

export default LeadCreationForm;
