// Types for the requerimientos module

export interface CiudadDesglose {
  ciudad: string;
  completados: number;
  estado?: 'solicitado' | 'recibido' | 'aceptado' | 'retrasado';
}

export interface RequerimientoData {
  categoria: string;
  completados: number;
  porcentaje: number;
  color: string;
  desglose?: CiudadDesglose[];
}

export interface ForecastData {
  requerimientosPrevistos: number;
  requerimientosRealizados: number;
  efectividad: number;
}

export type TipoCustodio = 
  | 'Custodio Estándar'
  | 'Custodio con Vehículo'
  | 'Custodio Armado'
  | 'Custodio Armado y con Vehículo'
  | 'Custodio A Bordo';

export interface CustodioRequirement {
  id: number;
  ciudad: string;
  mes: string;
  cantidad: number;
  tipoCustodio: TipoCustodio;
  // Adding these properties that are being used in the code
  armado: boolean;
  abordo?: boolean;
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
