
import React, { useMemo } from 'react';
import { RequerimientosProvider, useRequerimientos } from '@/components/requerimientos/RequerimientosContext';
import ObjectivosPage from '@/components/requerimientos/ObjectivosPage';
import CustodioRequirements from '@/components/requerimientos/CustodioRequirements';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Componente principal que usa el contexto
const RequerimientosContent = React.memo(() => {
  const { mesesDelAnio, mesActual } = useRequerimientos();

  // Memoizar el mes actual para evitar recálculos
  const currentMonth = useMemo(() => mesesDelAnio[mesActual], [mesesDelAnio, mesActual]);
  
  return (
    <div className="container mx-auto px-6 py-24">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Requerimientos</h1>
        <p className="text-muted-foreground mt-1">
          Seguimiento de objetivos completados vs. previstos para {currentMonth}
        </p>
      </div>
      
      <Tabs defaultValue="objetivos" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="objetivos">Objetivos</TabsTrigger>
          <TabsTrigger value="custodios">Requisitos de Custodios</TabsTrigger>
        </TabsList>
        
        <TabsContent value="objetivos">
          <ObjectivosPage />
        </TabsContent>
        
        <TabsContent value="custodios">
          <CustodioRequirements />
        </TabsContent>
      </Tabs>
    </div>
  );
});

RequerimientosContent.displayName = 'RequerimientosContent';

// Componente contenedor que proporciona el contexto
const Requerimientos = () => {
  return (
    <RequerimientosProvider>
      <RequerimientosContent />
    </RequerimientosProvider>
  );
};

export default Requerimientos;
