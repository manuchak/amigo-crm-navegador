
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";

// Tipos de datos
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
  procesado?: boolean; // Añadimos este campo para marcar como procesado
}

// Claves para localStorage
const STORAGE_KEYS = {
  REQUERIMIENTOS: 'datos_requerimientos',
  FORECAST: 'datos_forecast',
  CUSTODIOS: 'requisitos_custodios'
};

// Interface del contexto
interface RequerimientosContextType {
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
  marcarComoProcesado: (id: number) => void; // Nueva función para marcar como procesado
}

// Crear el contexto
const RequerimientosContext = createContext<RequerimientosContextType | undefined>(undefined);

// Proveedor del contexto
export const RequerimientosProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  
  // Months and cities data
  const mesesDelAnio = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const mesActual = new Date().getMonth();
  
  const ciudadesMexico = [
    'CDMX', 'Guadalajara', 'Monterrey', 'Puebla', 'Tijuana', 'León', 'Juárez', 
    'Veracruz', 'Zapopan', 'Mérida', 'Cancún', 'Querétaro', 'Acapulco'
  ];

  // Datos iniciales
  const datosRequerimientosIniciales: RequerimientoData[] = [
    { 
      categoria: 'Adquisición Custodios', 
      completados: 38, 
      objetivo: 50, 
      porcentaje: 76,
      color: 'bg-blue-500',
      desglose: [
        { ciudad: 'CDMX', completados: 15, objetivo: 20 },
        { ciudad: 'Guadalajara', completados: 10, objetivo: 15 },
        { ciudad: 'Monterrey', completados: 8, objetivo: 10 },
        { ciudad: 'Veracruz', completados: 5, objetivo: 5 }
      ]
    },
    { 
      categoria: 'Custodios Nuevos', 
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

  const forecastDataInicial: ForecastData = {
    requerimientosPrevistos: 240,
    requerimientosRealizados: 187,
    efectividad: 78
  };

  // States con persistencia en localStorage
  const [datosRequerimientos, setDatosRequerimientos] = useState<RequerimientoData[]>(() => {
    const savedData = localStorage.getItem(STORAGE_KEYS.REQUERIMIENTOS);
    return savedData ? JSON.parse(savedData) : datosRequerimientosIniciales;
  });

  const [forecastData, setForecastData] = useState<ForecastData>(() => {
    const savedData = localStorage.getItem(STORAGE_KEYS.FORECAST);
    return savedData ? JSON.parse(savedData) : forecastDataInicial;
  });

  const [custodioRequirements, setCustodioRequirements] = useState<CustodioRequirement[]>(() => {
    const savedData = localStorage.getItem(STORAGE_KEYS.CUSTODIOS);
    return savedData ? JSON.parse(savedData) : [];
  });

  // Efectos para guardar cambios en localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REQUERIMIENTOS, JSON.stringify(datosRequerimientos));
  }, [datosRequerimientos]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FORECAST, JSON.stringify(forecastData));
  }, [forecastData]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CUSTODIOS, JSON.stringify(custodioRequirements));
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
    const nuevaEfectividad = Math.round((nuevosDatos.requerimientosRealizados / nuevosDatos.requerimientosPrevistos) * 100);
    
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
      procesado: false // Por defecto, un nuevo requisito no está procesado
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

  // Nueva función para marcar como procesado
  const marcarComoProcesado = (id: number) => {
    setCustodioRequirements(prev => 
      prev.map(item => 
        item.id === id ? { ...item, procesado: !item.procesado } : item
      )
    );
    
    toast({
      title: "Estado actualizado",
      description: "El estado del requisito ha sido actualizado."
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
    marcarComoProcesado
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
