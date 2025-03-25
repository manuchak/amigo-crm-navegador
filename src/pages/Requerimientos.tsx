
import React from 'react';
import { RequerimientosProvider, useRequerimientos } from '@/components/requerimientos/RequerimientosContext';
import ProgressCard from '@/components/requerimientos/ProgressCard';
import ForecastSummary from '@/components/requerimientos/ForecastSummary';
import CustodioRequirementsCard from '@/components/requerimientos/CustodioRequirementsCard';
import EditarObjetivoForm from '@/components/requerimientos/EditarObjetivoForm';
import EditarForecastForm from '@/components/requerimientos/EditarForecastForm';

// Componente principal que usa el contexto
const RequerimientosContent = () => {
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
    eliminarRequisitosCustodios
  } = useRequerimientos();

  // Para simplificar la edición del objetivo, usaremos un estado para rastrear qué categoría se está editando
  const [categoriaEditando, setCategoriaEditando] = React.useState<number | null>(null);
  const [editingForecast, setEditingForecast] = React.useState(false);

  return (
    <div className="container mx-auto px-6 py-24">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Requerimientos</h1>
        <p className="text-muted-foreground mt-1">
          Seguimiento de objetivos completados vs. previstos para {mesesDelAnio[mesActual]}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {datosRequerimientos.map((req, index) => (
          <ProgressCard 
            key={index} 
            req={req} 
            index={index}
            onEdit={() => setCategoriaEditando(index)}
          />
        ))}
      </div>

      {categoriaEditando !== null && (
        <EditarObjetivoForm
          categoria={datosRequerimientos[categoriaEditando]}
          index={categoriaEditando}
          onUpdate={(index, datos) => {
            actualizarObjetivo(index, datos);
            setCategoriaEditando(null);
          }}
        />
      )}

      <ForecastSummary
        forecastData={forecastData}
        onEdit={() => setEditingForecast(true)}
      />

      {editingForecast && (
        <EditarForecastForm
          forecast={forecastData}
          onUpdate={(datos) => {
            actualizarForecast(datos);
            setEditingForecast(false);
          }}
        />
      )}

      <CustodioRequirementsCard
        requirements={custodioRequirements}
        ciudadesMexico={ciudadesMexico}
        mesesDelAnio={mesesDelAnio}
        currentMonth={mesesDelAnio[mesActual]}
        onAddRequirement={agregarRequisitosCustodios}
        onDeleteRequirement={eliminarRequisitosCustodios}
      />
    </div>
  );
};

// Componente contenedor que proporciona el contexto
const Requerimientos = () => {
  return (
    <RequerimientosProvider>
      <RequerimientosContent />
    </RequerimientosProvider>
  );
};

export default Requerimientos;
