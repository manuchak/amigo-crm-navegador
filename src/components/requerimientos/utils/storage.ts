
import { RequerimientoData, ForecastData, CustodioRequirement } from '../types';

// Storage keys for localStorage
export const STORAGE_KEYS = {
  REQUERIMIENTOS: 'datos_requerimientos',
  FORECAST: 'datos_forecast',
  CUSTODIOS: 'requisitos_custodios'
};

// Default data values
export const datosRequerimientosIniciales: RequerimientoData[] = [
  { 
    categoria: 'Adquisición Custodios Armados', 
    completados: 12, 
    objetivo: 20, 
    porcentaje: 60,
    color: 'bg-purple-500',
    desglose: [
      { ciudad: 'CDMX', completados: 4, objetivo: 6 },
      { ciudad: 'Guadalajara', completados: 3, objetivo: 5 },
      { ciudad: 'Monterrey', completados: 2, objetivo: 4 },
      { ciudad: 'Veracruz', completados: 3, objetivo: 5 }
    ]
  },
  { 
    categoria: 'Adquisición Custodios Armados', 
    completados: 12, 
    objetivo: 20, 
    porcentaje: 60,
    color: 'bg-purple-500' 
  },
  { 
    categoria: 'Contratos firmados', 
    completados: 5, 
    objetivo: 10, 
    porcentaje: 50,
    color: 'bg-emerald-500',
    desglose: [
      { ciudad: 'CDMX', completados: 2, objetivo: 4 },
      { ciudad: 'Guadalajara', completados: 1, objetivo: 3 },
      { ciudad: 'Monterrey', completados: 1, objetivo: 2 },
      { ciudad: 'Veracruz', completados: 1, objetivo: 1 }
    ]
  },
  { 
    categoria: 'Reuniones agendadas', 
    completados: 45, 
    objetivo: 40, 
    porcentaje: 112,
    color: 'bg-amber-500' 
  }
];

export const forecastDataInicial: ForecastData = {
  requerimientosPrevistos: 240,
  requerimientosRealizados: 187,
  efectividad: 78
};

// Function to load data from localStorage
export function loadFromStorage<T>(key: string, defaultValue: T): T {
  const savedData = localStorage.getItem(key);
  return savedData ? JSON.parse(savedData) : defaultValue;
}

// Function to save data to localStorage
export function saveToStorage(key: string, data: any): void {
  localStorage.setItem(key, JSON.stringify(data));
}
