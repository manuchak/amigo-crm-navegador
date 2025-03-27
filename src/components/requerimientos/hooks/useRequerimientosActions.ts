
import React from 'react';
import { 
  RequerimientoData, 
  ForecastData, 
  CustodioRequirement
} from '../types';
import { useForecastActions } from './useForecastActions';
import { useCustodioActions } from './useCustodioActions';

type SetDatosRequerimientos = React.Dispatch<React.SetStateAction<RequerimientoData[]>>;
type SetForecastData = React.Dispatch<React.SetStateAction<ForecastData>>;
type SetCustodioRequirements = React.Dispatch<React.SetStateAction<CustodioRequirement[]>>;

/**
 * Main hook that composes all requerimientos actions
 */
export function useRequerimientosActions(
  datosRequerimientos: RequerimientoData[],
  setDatosRequerimientos: SetDatosRequerimientos,
  forecastData: ForecastData,
  setForecastData: SetForecastData,
  custodioRequirements: CustodioRequirement[],
  setCustodioRequirements: SetCustodioRequirements
) {
  // Get actions from specialized hooks
  const forecastActions = useForecastActions(forecastData, setForecastData);
  const custodioActions = useCustodioActions(custodioRequirements, setCustodioRequirements);

  // Special handler for forecast updates that also considers custodio requirements
  const actualizarForecast = (nuevosDatos: { requerimientosPrevistos: number; requerimientosRealizados: number }) => {
    // Update the forecast as normal
    forecastActions.actualizarForecast(nuevosDatos);
    
    // Additional logic based on custodio requirements if needed
    // This maintains compatibility with the original implementation
    const totalRequerimientos = custodioRequirements.length;
    if (totalRequerimientos > 0) {
      // Any additional logic can go here if needed
    }
  };

  return {
    // Return all actions from the specialized hooks
    actualizarObjetivo: forecastActions.actualizarObjetivo,
    actualizarForecast,
    agregarRequisitosCustodios: custodioActions.agregarRequisitosCustodios,
    eliminarRequisitosCustodios: custodioActions.eliminarRequisitosCustodios,
    actualizarEstadoCustodio: custodioActions.actualizarEstadoCustodio
  };
}
