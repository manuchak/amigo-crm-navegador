
// Types for the requerimientos module

export interface CiudadDesglose {
  ciudad: string;
  completados: number;
  objetivo: number;
}

export interface RequerimientoData {
  categoria: string;
  completados: number;
  objetivo: number;
  porcentaje: number;
  color: string;
  desglose?: CiudadDesglose[];
}

export interface ForecastData {
  requerimientosPrevistos: number;
  requerimientosRealizados: number;
  efectividad: number;
}

export interface CustodioRequirement {
  id: number;
  ciudad: string;
  mes: string;
  cantidad: number;
  armado: boolean;
  zona?: string;
  solicitante: string;
  fechaCreacion: string;
  procesado?: boolean;
}

// Interface for the context
export interface RequerimientosContextType {
  datosRequerimientos: RequerimientoData[];
  forecastData: ForecastData;
  custodioRequirements: CustodioRequirement[];
  mesesDelAnio: string[];
  ciudadesMexico: string[];
  mesActual: number;
  actualizarObjetivo: (categoriaIndex: number, datos: { objetivo: number; desglose?: { objetivo: number }[] }) => void;
  actualizarForecast: (nuevosDatos: { requerimientosPrevistos: number; requerimientosRealizados: number }) => void;
  agregarRequisitosCustodios: (data: any) => void;
  eliminarRequisitosCustodios: (id: number) => void;
  marcarComoProcesado: (id: number) => void;
}
