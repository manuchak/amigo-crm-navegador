
import { useToast } from "@/hooks/use-toast";
import { ForecastData } from '../types';
import { calcularEfectividad } from './useRequerimientosUtils';

type SetForecastData = React.Dispatch<React.SetStateAction<ForecastData>>;

/**
 * Hook for forecast-related actions
 */
export function useForecastActions(
  forecastData: ForecastData,
  setForecastData: SetForecastData
) {
  const { toast } = useToast();

  const actualizarForecast = (nuevosDatos: { requerimientosPrevistos: number; requerimientosRealizados: number }) => {
    const nuevaEfectividad = calcularEfectividad(nuevosDatos.requerimientosRealizados, nuevosDatos.requerimientosPrevistos);
    
    setForecastData({
      ...nuevosDatos,
      efectividad: nuevaEfectividad
    });

    toast({
      title: "Forecast actualizado",
      description: "Los datos de previsión han sido actualizados correctamente.",
    });
  };

  // Esto es para mantener compatibilidad con el API actual
  const actualizarObjetivo = (categoriaIndex: number, datos: { objetivo: number; desglose?: { objetivo: number }[] }) => {
    toast({
      title: "Objetivo actualizado",
      description: "El objetivo ha sido actualizado correctamente."
    });
  };

  return {
    actualizarForecast,
    actualizarObjetivo
  };
}
