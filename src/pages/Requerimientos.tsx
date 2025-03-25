
import React, { useMemo } from 'react';
import { RequerimientosProvider, useRequerimientos } from '@/components/requerimientos/RequerimientosContext';
import ProgressCard from '@/components/requerimientos/ProgressCard';
import ForecastSummary from '@/components/requerimientos/ForecastSummary';
import CustodioRequirementsCard from '@/components/requerimientos/CustodioRequirementsCard';
import EditarObjetivoForm from '@/components/requerimientos/EditarObjetivoForm';
import EditarForecastForm from '@/components/requerimientos/EditarForecastForm';

// Componente principal que usa el contexto
const RequerimientosContent = React.memo(() => {
  const {
    datosRequerimientos,
    forecastData,
    custodioRequirements,
    mesesDelAnio,
    ciudadesMexico,
    mesActual,
    actualizarObjetivo,
    actualizarForecast,
    agregarRequisitosCustodios,
    eliminarRequisitosCustodios,
    actualizarEstadoCustodio
  } = useRequerimientos();

  // Para simplificar la edición del objetivo, usaremos un estado para rastrear qué categoría se está editando
  const [categoriaEditando, setCategoriaEditando] = React.useState<number | null>(null);
  const [editingForecast, setEditingForecast] = React.useState(false);

  // Memoizar el mes actual para evitar recálculos
  const currentMonth = useMemo(() => mesesDelAnio[mesActual], [mesesDelAnio, mesActual]);
  
  // Callbacks memorizados para evitar recreaciones
  const handleEditObjetivo = React.useCallback((index: number) => {
    setCategoriaEditando(index);
  }, []);

  const handleUpdateObjetivo = React.useCallback((index: number, datos: any) => {
    actualizarObjetivo(index, datos);
    setCategoriaEditando(null);
  }, [actualizarObjetivo]);

  const handleEditForecast = React.useCallback(() => {
    setEditingForecast(true);
  }, []);

  const handleUpdateForecast = React.useCallback((datos: any) => {
    actualizarForecast(datos);
    setEditingForecast(false);
  }, [actualizarForecast]);

  return (
    <div className="container mx-auto px-6 py-24">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Requerimientos</h1>
        <p className="text-muted-foreground mt-1">
          Seguimiento de objetivos completados vs. previstos para {currentMonth}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {datosRequerimientos.map((req, index) => (
          <ProgressCard 
            key={index} 
            req={req} 
            index={index}
            onEdit={handleEditObjetivo}
          />
        ))}
      </div>

      {categoriaEditando !== null && (
        <EditarObjetivoForm
          categoria={datosRequerimientos[categoriaEditando]}
          index={categoriaEditando}
          onUpdate={handleUpdateObjetivo}
        />
      )}

      <ForecastSummary
        forecastData={forecastData}
        onEdit={handleEditForecast}
      />

      {editingForecast && (
        <EditarForecastForm
          forecast={forecastData}
          onUpdate={handleUpdateForecast}
        />
      )}

      <CustodioRequirementsCard
        requirements={custodioRequirements}
        ciudadesMexico={ciudadesMexico}
        mesesDelAnio={mesesDelAnio}
        currentMonth={currentMonth}
        onAddRequirement={agregarRequisitosCustodios}
        onDeleteRequirement={eliminarRequisitosCustodios}
        onUpdateEstado={actualizarEstadoCustodio}
      />
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
