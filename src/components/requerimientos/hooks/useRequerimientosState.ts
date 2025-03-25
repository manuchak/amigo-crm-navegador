
import { useState, useEffect } from 'react';
import { 
  RequerimientoData, 
  ForecastData, 
  CustodioRequirement 
} from '../types';
import { 
  STORAGE_KEYS, 
  datosRequerimientosIniciales, 
  forecastDataInicial,
  loadFromStorage,
  saveToStorage
} from '../utils/storage';

/**
 * Custom hook for managing requerimientos state with localStorage persistence
 */
export function useRequerimientosState() {
  // States con persistencia en localStorage
  const [datosRequerimientos, setDatosRequerimientos] = useState<RequerimientoData[]>(() => 
    loadFromStorage(STORAGE_KEYS.REQUERIMIENTOS, datosRequerimientosIniciales)
  );

  const [forecastData, setForecastData] = useState<ForecastData>(() => 
    loadFromStorage(STORAGE_KEYS.FORECAST, forecastDataInicial)
  );

  const [custodioRequirements, setCustodioRequirements] = useState<CustodioRequirement[]>(() => {
    const savedRequirements = loadFromStorage(STORAGE_KEYS.CUSTODIOS, []);
    // Migrar datos antiguos que usan 'procesado' al nuevo formato con 'estado'
    return savedRequirements.map((req: any) => {
      if (req.procesado !== undefined && req.estado === undefined) {
        return {
          ...req,
          estado: req.procesado ? 'aceptado' : 'solicitado'
        };
      }
      return req.estado ? req : { ...req, estado: 'solicitado' };
    });
  });

  // Efectos para guardar cambios en localStorage
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.REQUERIMIENTOS, datosRequerimientos);
  }, [datosRequerimientos]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.FORECAST, forecastData);
  }, [forecastData]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.CUSTODIOS, custodioRequirements);
  }, [custodioRequirements]);

  return {
    datosRequerimientos,
    setDatosRequerimientos,
    forecastData,
    setForecastData,
    custodioRequirements,
    setCustodioRequirements
  };
}
