
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { 
  RequerimientosContextType, 
  RequerimientoData, 
  ForecastData, 
  CustodioRequirement 
} from './types';
import { 
  STORAGE_KEYS, 
  datosRequerimientosIniciales, 
  forecastDataInicial,
  loadFromStorage,
  saveToStorage
} from './utils/storage';
import { 
  mesesDelAnio, 
  ciudadesMexico,
  calcularEfectividad
} from './utils/dataUtils';

// Crear el contexto
const RequerimientosContext = createContext<RequerimientosContextType | undefined>(undefined);

// Proveedor del contexto
export const RequerimientosProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const mesActual = new Date().getMonth();

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

  // Functions to update data
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
    const newRequirement = {
      ...data,
      id: Date.now(),
      fechaCreacion: new Date().toISOString(),
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
  };

  const eliminarRequisitosCustodios = (id: number) => {
    setCustodioRequirements(prev => prev.filter(item => item.id !== id));
    toast({
      title: "Requisito eliminado",
      description: "El requisito ha sido eliminado correctamente."
    });
  };

  // Función para actualizar el estado de un custodio
  const actualizarEstadoCustodio = (id: number, estado: 'solicitado' | 'recibido' | 'aceptado') => {
    setCustodioRequirements(prev => 
      prev.map(item => {
        if (item.id === id) {
          // Si el estado cambió a 'aceptado', agregar información del aprobador
          if (estado === 'aceptado' && item.estado !== 'aceptado') {
            return { 
              ...item, 
              estado,
              usuarioAprobador: 'Admin Supply', // En un sistema real, usaríamos el nombre del usuario actual
              fechaAprobacion: new Date().toISOString()
            };
          }
          // Si el estado cambió de 'aceptado' a otro, eliminamos la información del aprobador
          if (estado !== 'aceptado' && item.estado === 'aceptado') {
            const { usuarioAprobador, fechaAprobacion, ...rest } = item;
            return { ...rest, estado };
          }
          return { ...item, estado };
        }
        return item;
      })
    );
    
    const estadoLabel = {
      'solicitado': 'Solicitado',
      'recibido': 'Recibido Supply',
      'aceptado': 'Aceptado Supply'
    }[estado];
    
    toast({
      title: "Estado actualizado",
      description: `El requisito ha sido marcado como "${estadoLabel}".`
    });
  };

  const value = {
    datosRequerimientos,
    forecastData,
    custodioRequirements,
    mesesDelAnio,
    ciudadesMexico,
    mesActual,
    actualizarObjetivo,
    actualizarForecast,
    agregarRequisitosCustodios,
    eliminarRequisitosCustodios,
    actualizarEstadoCustodio
  };

  return (
    <RequerimientosContext.Provider value={value}>
      {children}
    </RequerimientosContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useRequerimientos = () => {
  const context = useContext(RequerimientosContext);
  if (context === undefined) {
    throw new Error('useRequerimientos debe ser usado dentro de un RequerimientosProvider');
  }
  return context;
};
