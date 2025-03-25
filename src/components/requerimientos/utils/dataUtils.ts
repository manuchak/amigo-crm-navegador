
import { RequerimientoData, ForecastData, CustodioRequirement } from '../types';

// Constants
export const mesesDelAnio = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export const ciudadesMexico = [
  'CDMX', 'Guadalajara', 'Monterrey', 'Puebla', 'Tijuana', 'León', 'Juárez', 
  'Veracruz', 'Zapopan', 'Mérida', 'Cancún', 'Querétaro', 'Acapulco'
];

// Helpers for data manipulation
export function calcularEfectividad(realizados: number, previstos: number): number {
  return Math.round((realizados / previstos) * 100);
}

export function actualizarPorcentaje(completados: number, objetivo: number): number {
  return Math.round((completados / objetivo) * 100);
}
