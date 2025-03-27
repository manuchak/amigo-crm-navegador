
import React, { createContext } from 'react';
import { RequerimientosContextType } from '../types';
import { mesesDelAnio, ciudadesMexico } from '../utils/dataUtils';
import { useRequerimientosState } from '../hooks/useRequerimientosState';
import { useRequerimientosActions } from '../hooks/useRequerimientosActions';

// Crear el contexto
export const RequerimientosContext = createContext<RequerimientosContextType | undefined>(undefined);

// Proveedor del contexto
export const RequerimientosProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const mesActual = new Date().getMonth();
  
  const {
    datosRequerimientos,
    setDatosRequerimientos,
    forecastData,
    setForecastData,
    custodioRequirements,
    setCustodioRequirements
  } = useRequerimientosState();

  const {
    actualizarObjetivo,
    actualizarForecast,
    agregarRequisitosCustodios,
    eliminarRequisitosCustodios,
    actualizarEstadoCustodio
  } = useRequerimientosActions(
    datosRequerimientos,
    setDatosRequerimientos,
    forecastData,
    setForecastData,
    custodioRequirements,
    setCustodioRequirements
  );

  const value = {
    datosRequerimientos,
    setDatosRequerimientos,
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
  };

  return (
    <RequerimientosContext.Provider value={value}>
      {children}
    </RequerimientosContext.Provider>
  );
};
