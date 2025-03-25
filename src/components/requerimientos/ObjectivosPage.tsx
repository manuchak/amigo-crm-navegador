
import React, { useCallback, useState } from 'react';
import { useRequerimientos } from './RequerimientosContext';
import ProgressCard from './ProgressCard';
import ForecastSummary from './ForecastSummary';
import EditarObjetivoForm from './EditarObjetivoForm';
import EditarForecastForm from './EditarForecastForm';

const ObjectivosPage = () => {
  const {
    datosRequerimientos,
    forecastData,
    actualizarObjetivo,
    actualizarForecast
  } = useRequerimientos();

  // Para simplificar la edición del objetivo, usaremos un estado para rastrear qué categoría se está editando
  const [categoriaEditando, setCategoriaEditando] = useState<number | null>(null);
  const [editingForecast, setEditingForecast] = useState(false);
  
  // Callbacks memorizados para evitar recreaciones
  const handleEditObjetivo = useCallback((index: number) => {
    setCategoriaEditando(index);
  }, []);

  const handleUpdateObjetivo = useCallback((index: number, datos: any) => {
    actualizarObjetivo(index, datos);
    setCategoriaEditando(null);
  }, [actualizarObjetivo]);

  const handleEditForecast = useCallback(() => {
    setEditingForecast(true);
  }, []);

  const handleUpdateForecast = useCallback((datos: any) => {
    actualizarForecast(datos);
    setEditingForecast(false);
  }, [actualizarForecast]);

  return (
    <div className="mt-6">
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
    </div>
  );
};

export default ObjectivosPage;
