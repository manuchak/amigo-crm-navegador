
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PageLayout from '@/components/layout/PageLayout';
import { LeadsProvider } from '@/context/LeadsContext';
import { JourneyStagesCard } from '@/components/lead-journey/JourneyStagesCard';
import { LeadInitialInterview } from '@/components/lead-journey/LeadInitialInterview';
import { LeadValidation } from '@/components/lead-journey/LeadValidation';
import { DocumentCollection } from '@/components/lead-journey/DocumentCollection';
import { PsychometricTests } from '@/components/lead-journey/PsychometricTests';
import { FieldTests } from '@/components/lead-journey/FieldTests';
import { SpecializedEvaluation } from '@/components/lead-journey/SpecializedEvaluation';
import { Hiring } from '@/components/lead-journey/Hiring';
import { ProcessSummary } from '@/components/lead-journey/ProcessSummary';

const LeadJourney: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('journey');
  
  return (
    <PageLayout title="Proceso de Custodios">
      <LeadsProvider>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6 bg-white">
            <TabsTrigger value="journey" className="text-sm">Proceso</TabsTrigger>
            <TabsTrigger value="interviews" className="text-sm">Entrevistas Iniciales</TabsTrigger>
            <TabsTrigger value="validation" className="text-sm">Validación</TabsTrigger>
            <TabsTrigger value="documents" className="text-sm">Documentación</TabsTrigger>
            <TabsTrigger value="tests" className="text-sm">Exámenes</TabsTrigger>
            <TabsTrigger value="fieldtests" className="text-sm">Pruebas de Campo</TabsTrigger>
            <TabsTrigger value="summary" className="text-sm">Resumen</TabsTrigger>
          </TabsList>
          
          <TabsContent value="journey" className="mt-0 animate-fade-in">
            <JourneyStagesCard />
          </TabsContent>
          
          <TabsContent value="interviews" className="mt-0 animate-fade-in">
            <LeadInitialInterview />
          </TabsContent>
          
          <TabsContent value="validation" className="mt-0 animate-fade-in">
            <LeadValidation />
          </TabsContent>
          
          <TabsContent value="documents" className="mt-0 animate-fade-in">
            <DocumentCollection />
          </TabsContent>
          
          <TabsContent value="tests" className="mt-0 animate-fade-in">
            <PsychometricTests />
          </TabsContent>
          
          <TabsContent value="fieldtests" className="mt-0 animate-fade-in">
            <FieldTests />
          </TabsContent>
          
          <TabsContent value="summary" className="mt-0 animate-fade-in">
            <ProcessSummary />
          </TabsContent>
        </Tabs>
      </LeadsProvider>
    </PageLayout>
  );
};

export default LeadJourney;
