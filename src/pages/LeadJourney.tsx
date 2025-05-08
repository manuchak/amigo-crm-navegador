import React, { useState } from 'react';
import { useNavigate, Navigate, Routes, Route } from 'react-router-dom';
import { LeadInitialInterview } from '@/components/lead-journey/LeadInitialInterview';
import { LeadValidation } from '@/components/lead-journey/LeadValidation';
import { DocumentCollection } from '@/components/lead-journey/DocumentCollection';
import { FieldTests } from '@/components/lead-journey/FieldTests';
import { PsychometricTests } from '@/components/lead-journey/PsychometricTests';
import { Hiring } from '@/components/lead-journey/Hiring';
import { ProcessSummary } from '@/components/lead-journey/ProcessSummary';
import { JourneyStagesCard } from '@/components/lead-journey/JourneyStagesCard';
import { JourneyWorkflow } from '@/components/lead-journey/JourneyWorkflow';
import { LeadAssignmentProcess } from '@/components/lead-journey/LeadAssignmentProcess';
import { useAuth } from '@/context/auth';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation } from 'react-router-dom';

interface Stage {
  name: string;
  description: string;
  path: string;
}

const LeadJourney: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('workflow');
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  const stages = [
    { name: 'Flujo de Trabajo', description: 'Descripción del flujo de trabajo', path: 'workflow' },
    { name: 'Entrevistas', description: 'Entrevistas iniciales', path: 'interviews' },
    { name: 'Validación', description: 'Validación de datos', path: 'validation' },
    { name: 'Documentación', description: 'Recolección de documentos', path: 'documents' },
    { name: 'Pruebas de Campo', description: 'Realización de pruebas de campo', path: 'field-tests' },
    { name: 'Pruebas Psicométricas', description: 'Aplicación de pruebas psicométricas', path: 'psychometric' },
    { name: 'Contratación', description: 'Proceso de contratación', path: 'hiring' },
    { name: 'Resumen', description: 'Resumen del proceso', path: 'summary' },
  ];

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    navigate(value);
  };

  const location = useLocation();
  const getTabValue = () => {
    const path = location.pathname.split('/')[2];
    return path || 'workflow';
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Lead Journey</h1>
      
      {/* Tabs navigation */}
      <Tabs value={getTabValue()} onValueChange={handleTabChange} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="workflow">Flujo de Trabajo</TabsTrigger>
          <TabsTrigger value="interviews">Entrevistas</TabsTrigger>
          <TabsTrigger value="assignment-process">Proceso de Asignación</TabsTrigger>
          <TabsTrigger value="validation">Validación</TabsTrigger>
          <TabsTrigger value="documents">Documentación</TabsTrigger>
          <TabsTrigger value="field-tests">Pruebas de Campo</TabsTrigger>
          <TabsTrigger value="psychometric">Pruebas Psicométricas</TabsTrigger>
          <TabsTrigger value="hiring">Contratación</TabsTrigger>
          <TabsTrigger value="summary">Resumen</TabsTrigger>
        </TabsList>
      </Tabs>
      
      {/* Tab content */}
      <Routes>
        <Route path="/" element={<Navigate to="workflow" />} />
        <Route path="/workflow" element={<JourneyWorkflow />} />
        <Route path="/interviews" element={<LeadInitialInterview />} />
        <Route path="/assignment-process" element={<LeadAssignmentProcess />} />
        <Route path="/validation" element={<LeadValidation />} />
        <Route path="/documents" element={<DocumentCollection />} />
        <Route path="/field-tests" element={<FieldTests />} />
        <Route path="/psychometric" element={<PsychometricTests />} />
        <Route path="/hiring" element={<Hiring />} />
        <Route path="/summary" element={<ProcessSummary />} />
      </Routes>
      
      {/* Journey Stages Card */}
      <JourneyStagesCard stages={stages} />
    </div>
  );
};

export default LeadJourney;
