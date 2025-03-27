
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
  abordo: boolean; // Field for "A bordo" option
  zona?: string;
  solicitante: string;
  fechaCreacion: string;
  horaCreacion: string; // Field for creation time
  estado: 'solicitado' | 'recibido' | 'aceptado' | 'retrasado';
  usuarioAprobador?: string;
  fechaAprobacion?: string;
  horaAprobacion?: string; // Field for approval time
}

// Interface for the context
export interface RequerimientosContextType {
  datosRequerimientos: RequerimientoData[];
  setDatosRequerimientos: React.Dispatch<React.SetStateAction<RequerimientoData[]>>;
  forecastData: ForecastData;
  custodioRequirements: CustodioRequirement[];
  mesesDelAnio: string[];
  ciudadesMexico: string[];
  mesActual: number;
  actualizarObjetivo: (categoriaIndex: number, datos: { objetivo: number; desglose?: { objetivo: number }[] }) => void;
  actualizarForecast: (nuevosDatos: { requerimientosPrevistos: number; requerimientosRealizados: number }) => void;
  agregarRequisitosCustodios: (data: any) => void;
  eliminarRequisitosCustodios: (id: number) => void;
  actualizarEstadoCustodio: (id: number, estado: 'solicitado' | 'recibido' | 'aceptado' | 'retrasado') => void;
}
