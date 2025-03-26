
import React, { useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { 
  RequerimientoData, 
  ForecastData, 
  CustodioRequirement 
} from '../types';
import { calcularEfectividad } from '../utils/dataUtils';

type SetDatosRequerimientos = React.Dispatch<React.SetStateAction<RequerimientoData[]>>;
type SetForecastData = React.Dispatch<React.SetStateAction<ForecastData>>;
type SetCustodioRequirements = React.Dispatch<React.SetStateAction<CustodioRequirement[]>>;

/**
 * Get current time in HH:MM:SS format
 */
const getCurrentTime = (): string => {
  const now = new Date();
  return now.toLocaleTimeString();
};

/**
 * Get current month name in Spanish
 */
const getCurrentMonth = (): string => {
  return new Date().toLocaleString('es-ES', { month: 'long' });
};

/**
 * Custom hook for requerimientos actions
 */
export function useRequerimientosActions(
  datosRequerimientos: RequerimientoData[],
  setDatosRequerimientos: SetDatosRequerimientos,
  forecastData: ForecastData,
  setForecastData: SetForecastData,
  custodioRequirements: CustodioRequirement[],
  setCustodioRequirements: SetCustodioRequirements
) {
  const { toast } = useToast();

  // Check and update delayed requirements
  const checkDelayedRequirements = () => {
    const currentMonth = getCurrentMonth().toLowerCase();
    
    const updatedRequirements = custodioRequirements.map(req => {
      // If it's in "solicitado" status and for the current month, mark as delayed
      if (req.estado === 'solicitado' && req.mes.toLowerCase() === currentMonth) {
        return { ...req, estado: 'retrasado' as const };
      }
      return req;
    });
    
    // Only update if there are actual changes
    if (JSON.stringify(updatedRequirements) !== JSON.stringify(custodioRequirements)) {
      setCustodioRequirements(updatedRequirements);
      
      // Show toast notification about delayed requirements
      const delayedCount = updatedRequirements.filter(req => req.estado === 'retrasado').length;
      if (delayedCount > 0) {
        toast({
          title: "Requisitos retrasados detectados",
          description: `Se han detectado ${delayedCount} requisitos de custodios retrasados para este mes.`,
          variant: "destructive"
        });
      }
    }
  };

  // Run the check for delayed requirements
  useEffect(() => {
    checkDelayedRequirements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [custodioRequirements]);

  const actualizarObjetivo = (categoriaIndex: number, datos: { objetivo: number; desglose?: { objetivo: number }[] }) => {
    const nuevosDatos = [...datosRequerimientos];
    
    // Actualizar objetivo principal
    if (datos.objetivo) {
      nuevosDatos[categoriaIndex].objetivo = Number(datos.objetivo);
      nuevosDatos[categoriaIndex].porcentaje = Math.round((nuevosDatos[categoriaIndex].completados / Number(datos.objetivo)) * 100);
    }

    // Actualizar objetivos por ciudad si existen
    if (datos.desglose && nuevosDatos[categoriaIndex].desglose) {
      datos.desglose.forEach((ciudadDatos, idx) => {
        if (nuevosDatos[categoriaIndex].desglose && nuevosDatos[categoriaIndex].desglose[idx]) {
          nuevosDatos[categoriaIndex].desglose[idx].objetivo = Number(ciudadDatos.objetivo);
        }
      });
    }

    setDatosRequerimientos(nuevosDatos);
    
    toast({
      title: "Objetivo actualizado",
      description: "El objetivo ha sido actualizado correctamente."
    });
  };

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

  const agregarRequisitosCustodios = (data: any) => {
    const currentDate = new Date().toISOString();
    const currentTime = getCurrentTime();
    
    const newRequirement = {
      ...data,
      id: Date.now(),
      fechaCreacion: currentDate,
      horaCreacion: currentTime,
      solicitante: 'Usuario Actual', // En un sistema real, esto vendría de la autenticación
      estado: 'solicitado' // Por defecto, un nuevo requisito está en estado solicitado
    };
    
    setCustodioRequirements(prev => [...prev, newRequirement]);
    
    // Actualizar el forecast basado en los nuevos requisitos
    const totalRequerimientos = custodioRequirements.length + 1;
    actualizarForecast({
      requerimientosPrevistos: totalRequerimientos * 10, // Ejemplo simple
      requerimientosRealizados: forecastData.requerimientosRealizados
    });
    
    toast({
      title: "Requisito agregado",
      description: `Requisito para ${data.cantidad} custodios en ${data.ciudad} agregado correctamente.`
    });
    
    // Check for delays after adding a new requirement
    checkDelayedRequirements();
  };

  const eliminarRequisitosCustodios = (id: number) => {
    setCustodioRequirements(prev => prev.filter(item => item.id !== id));
    toast({
      title: "Requisito eliminado",
      description: "El requisito ha sido eliminado correctamente."
    });
  };

  // Función para actualizar el estado de un custodio
  const actualizarEstadoCustodio = (id: number, estado: 'solicitado' | 'recibido' | 'aceptado' | 'retrasado') => {
    setCustodioRequirements(prev => 
      prev.map(item => {
        if (item.id === id) {
          // Si el requisito ya está en estado 'aceptado', no permitir cambios
          if (item.estado === 'aceptado') {
            toast({
              title: "Operación no permitida",
              description: "Un requisito aprobado no puede cambiar de estado.",
              variant: "destructive"
            });
            return item;
          }
          
          // Si el estado cambia a 'aceptado', agregar información del aprobador
          if (estado === 'aceptado') {
            return { 
              ...item, 
              estado,
              usuarioAprobador: 'Admin Supply', // En un sistema real, usaríamos el nombre del usuario actual
              fechaAprobacion: new Date().toISOString(),
              horaAprobacion: getCurrentTime()
            };
          }
          
          return { ...item, estado };
        }
        return item;
      })
    );
    
    const estadoLabel = {
      'solicitado': 'Solicitado',
      'recibido': 'Recibido Supply',
      'aceptado': 'Aceptado Supply',
      'retrasado': 'Retrasado'
    }[estado];
    
    toast({
      title: "Estado actualizado",
      description: `El requisito ha sido marcado como "${estadoLabel}".`
    });
    
    // Check for any changes in delayed status after updating
    if (estado !== 'retrasado') {
      checkDelayedRequirements();
    }
  };

  return {
    actualizarObjetivo,
    actualizarForecast,
    agregarRequisitosCustodios,
    eliminarRequisitosCustodios,
    actualizarEstadoCustodio
  };
}
