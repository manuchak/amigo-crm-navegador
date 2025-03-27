
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
    porcentaje: 60,
    color: 'bg-purple-500',
    desglose: [
      { ciudad: 'CDMX', completados: 4 },
      { ciudad: 'Guadalajara', completados: 3 },
      { ciudad: 'Monterrey', completados: 2 },
      { ciudad: 'Veracruz', completados: 3 }
    ]
  },
  { 
    categoria: 'Adquisición Custodios Armados', 
    completados: 12, 
    porcentaje: 60,
    color: 'bg-purple-500' 
  },
  { 
    categoria: 'Contratos firmados', 
    completados: 5, 
    porcentaje: 50,
    color: 'bg-emerald-500',
    desglose: [
      { ciudad: 'CDMX', completados: 2 },
      { ciudad: 'Guadalajara', completados: 1 },
      { ciudad: 'Monterrey', completados: 1 },
      { ciudad: 'Veracruz', completados: 1 }
    ]
  },
  { 
    categoria: 'Reuniones agendadas', 
    completados: 45, 
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
