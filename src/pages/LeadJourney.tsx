
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PageLayout from '@/components/layout/PageLayout';
import { LeadsProvider } from '@/context/LeadsContext';
import { JourneyStagesCard } from '@/components/lead-journey/JourneyStagesCard';
import { LeadInitialInterview } from '@/components/lead-journey/LeadInitialInterview';
import { LeadValidation } from '@/components/lead-journey/LeadValidation';
import { DocumentCollection } from '@/components/lead-journey/DocumentCollection';
import { PsychometricTests } from '@/components/lead-journey/PsychometricTests';
import { FieldTests } from '@/components/lead-journey/FieldTests';
import { Hiring } from '@/components/lead-journey/Hiring';
import { ProcessSummary } from '@/components/lead-journey/ProcessSummary';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { logPageAccess } from '@/context/auth/hooks/utils/userActions';
import { useAuth } from '@/context/auth/AuthContext';

const LeadJourney: React.FC = () => {
  const { tab } = useParams<{ tab?: string }>();
  const [activeTab, setActiveTab] = useState<string>('journey');
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  
  // Set active tab based on URL parameter
  useEffect(() => {
    if (tab && ['interviews', 'validation', 'documents', 'tests', 'fieldtests', 'hiring', 'summary'].includes(tab)) {
      setActiveTab(tab);
    } else if (location.pathname === '/lead-journey') {
      setActiveTab('journey');
    }
    
    // Log page access for analytics
    if (currentUser?.uid) {
      logPageAccess(currentUser.uid, `lead-journey/${activeTab}`);
    }
  }, [tab, location.pathname, currentUser, activeTab]);
  
  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === 'journey') {
      navigate('/lead-journey');
    } else {
      navigate(`/lead-journey/${value}`);
    }
  };
  
  return (
    <PageLayout title="Proceso de Custodios">
      <LeadsProvider>
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="mb-6 bg-white">
            <TabsTrigger value="journey" className="text-sm">Proceso</TabsTrigger>
            <TabsTrigger value="interviews" className="text-sm">Entrevistas Iniciales</TabsTrigger>
            <TabsTrigger value="validation" className="text-sm">Validación</TabsTrigger>
            <TabsTrigger value="documents" className="text-sm">Documentación</TabsTrigger>
            <TabsTrigger value="tests" className="text-sm">Exámenes</TabsTrigger>
            <TabsTrigger value="fieldtests" className="text-sm">Pruebas de Campo</TabsTrigger>
            <TabsTrigger value="hiring" className="text-sm">Contratación</TabsTrigger>
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
          
          <TabsContent value="hiring" className="mt-0 animate-fade-in">
            <Hiring />
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
