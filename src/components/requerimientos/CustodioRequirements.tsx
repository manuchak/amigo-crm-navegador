import React, { useEffect } from 'react';
import { useRequerimientos } from './context/RequerimientosContext';
import CustodioRequirementsCard from './CustodioRequirementsCard';
import { TipoCustodio } from './types';

const CustodioRequirements = () => {
  const {
    custodioRequirements,
    ciudadesMexico,
    mesesDelAnio,
    mesActual,
    agregarRequisitosCustodios,
    eliminarRequisitosCustodios,
    actualizarEstadoCustodio,
    datosRequerimientos,
    setDatosRequerimientos
  } = useRequerimientos();

  // Memoizar el mes actual para evitar recálculos
  const currentMonth = React.useMemo(() => mesesDelAnio[mesActual], [mesesDelAnio, mesActual]);

  // Helper function to determine if a custodio is armado based on tipoCustodio
  const isCustodioArmado = (tipoCustodio: TipoCustodio): boolean => {
    return tipoCustodio === 'Custodio Armado' || 
           tipoCustodio === 'Custodio Armado y con Vehículo';
  };

  // Helper function to determine if a custodio is abordo based on tipoCustodio
  const isCustodioAbordo = (tipoCustodio: TipoCustodio): boolean => {
    return tipoCustodio === 'Custodio A Bordo';
  };

  // Helper function to determine if a custodio has a vehicle based on tipoCustodio
  const isCustodioConVehiculo = (tipoCustodio: TipoCustodio): boolean => {
    return tipoCustodio === 'Custodio con Vehículo' || 
           tipoCustodio === 'Custodio Armado y con Vehículo';
  };

  // Actualizar los contadores basados en los requisitos aceptados
  useEffect(() => {
    if (custodioRequirements.length === 0) return;

    // Obtener todas las ciudades únicas
    const ciudadesUnicas = [...new Set(custodioRequirements.map(req => req.ciudad))];
    
    // Función para crear desgloses por ciudad
    const crearDesglosePorCiudad = (filtro: (req: any) => boolean) => {
      return ciudadesUnicas.map(ciudad => {
        // Filtramos requerimientos para esta ciudad y este tipo
        const reqsCiudad = custodioRequirements.filter(req => req.ciudad === ciudad && filtro(req));
        
        if (reqsCiudad.length === 0) return null;
        
        const cantidadCompletada = reqsCiudad.reduce((total, req) => total + req.cantidad, 0);
        
        // Determinamos el estado predominante para este tipo en esta ciudad
        // Priorizamos el estado más avanzado
        let estadoPredominante: 'solicitado' | 'recibido' | 'aceptado' | 'retrasado' = 'solicitado';
        
        if (reqsCiudad.some(req => req.estado === 'aceptado')) {
          estadoPredominante = 'aceptado';
        } else if (reqsCiudad.some(req => req.estado === 'recibido')) {
          estadoPredominante = 'recibido';
        } else if (reqsCiudad.some(req => req.estado === 'retrasado')) {
          estadoPredominante = 'retrasado';
        }
        
        return {
          ciudad,
          completados: cantidadCompletada,
          estado: estadoPredominante
        };
      }).filter(Boolean); // Eliminar elementos nulos
    };
    
    // Contadores para cada tipo de custodio - usando las funciones de ayuda
    const custodiosVehiculo = custodioRequirements
      .filter(req => isCustodioConVehiculo(req.tipoCustodio) && !isCustodioArmado(req.tipoCustodio))
      .reduce((total, req) => total + req.cantidad, 0);

    const custodiosArmados = custodioRequirements
      .filter(req => isCustodioArmado(req.tipoCustodio) && !isCustodioConVehiculo(req.tipoCustodio))
      .reduce((total, req) => total + req.cantidad, 0);

    const custodiosAbordo = custodioRequirements
      .filter(req => isCustodioAbordo(req.tipoCustodio))
      .reduce((total, req) => total + req.cantidad, 0);

    const custodiosVehiculoArmado = custodioRequirements
      .filter(req => isCustodioArmado(req.tipoCustodio) && isCustodioConVehiculo(req.tipoCustodio))
      .reduce((total, req) => total + req.cantidad, 0);
    
    // Desgloses por ciudad para cada tipo
    const desgloseVehiculo = crearDesglosePorCiudad(req => 
      isCustodioConVehiculo(req.tipoCustodio) && !isCustodioArmado(req.tipoCustodio));
    
    const desgloseArmados = crearDesglosePorCiudad(req => 
      isCustodioArmado(req.tipoCustodio) && !isCustodioConVehiculo(req.tipoCustodio));
    
    const desgloseAbordo = crearDesglosePorCiudad(req => 
      isCustodioAbordo(req.tipoCustodio));
    
    const desgloseVehiculoArmado = crearDesglosePorCiudad(req => 
      isCustodioArmado(req.tipoCustodio) && isCustodioConVehiculo(req.tipoCustodio));
    
    // Actualizar datos de requerimientos
    const updatedData = [
      {
        categoria: "Custodios con Vehículo",
        completados: custodiosVehiculo,
        porcentaje: custodiosVehiculo > 0 ? 100 : 0,
        color: "bg-blue-500",
        desglose: desgloseVehiculo
      },
      {
        categoria: "Custodios Armados",
        completados: custodiosArmados,
        porcentaje: custodiosArmados > 0 ? 100 : 0,
        color: "bg-amber-500",
        desglose: desgloseArmados
      },
      {
        categoria: "Custodios A Bordo",
        completados: custodiosAbordo,
        porcentaje: custodiosAbordo > 0 ? 100 : 0,
        color: "bg-green-500",
        desglose: desgloseAbordo
      },
      {
        categoria: "Custodios con Vehículo Armado",
        completados: custodiosVehiculoArmado,
        porcentaje: custodiosVehiculoArmado > 0 ? 100 : 0,
        color: "bg-purple-500",
        desglose: desgloseVehiculoArmado
      }
    ];
    
    setDatosRequerimientos(updatedData);
  }, [custodioRequirements, setDatosRequerimientos]);

  return (
    <div className="mt-6">
      <CustodioRequirementsCard
        requirements={custodioRequirements}
        ciudadesMexico={ciudadesMexico}
        mesesDelAnio={mesesDelAnio}
        currentMonth={currentMonth}
        onAddRequirement={agregarRequisitosCustodios}
        onDeleteRequirement={eliminarRequisitosCustodios}
        onUpdateEstado={actualizarEstadoCustodio}
      />
    </div>
  );
};

export default CustodioRequirements;
