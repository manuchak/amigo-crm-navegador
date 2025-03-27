
import React, { useEffect } from 'react';
import { useRequerimientos } from './context/RequerimientosContext';
import CustodioRequirementsCard from './CustodioRequirementsCard';

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

  // Actualizar los contadores basados en los requisitos aceptados
  useEffect(() => {
    if (custodioRequirements.length === 0) return;

    // Filtrar solo requisitos aceptados
    const aceptados = custodioRequirements.filter(req => req.estado === 'aceptado');
    
    // Obtener todas las ciudades únicas
    const ciudadesUnicas = [...new Set(aceptados.map(req => req.ciudad))];
    
    // Crear desgloses por ciudad
    const crearDesglosePorCiudad = (filtro: (req: any) => boolean) => {
      return ciudadesUnicas.map(ciudad => {
        const reqsCiudad = aceptados.filter(req => req.ciudad === ciudad && filtro(req));
        const cantidadCompletada = reqsCiudad.reduce((total, req) => total + req.cantidad, 0);
        
        return {
          ciudad,
          completados: cantidadCompletada,
          objetivo: 10 // Valor por defecto, se puede ajustar basado en datos históricos
        };
      }).filter(item => item.completados > 0);
    };
    
    // Contadores para cada tipo de custodio
    const custodiosVehiculo = aceptados.filter(req => !req.armado && !req.abordo).reduce((total, req) => total + req.cantidad, 0);
    const custodiosArmados = aceptados.filter(req => req.armado && !req.abordo).reduce((total, req) => total + req.cantidad, 0);
    const custodiosAbordo = aceptados.filter(req => req.abordo).reduce((total, req) => total + req.cantidad, 0);
    const custodiosVehiculoArmado = aceptados.filter(req => req.armado && !req.abordo).reduce((total, req) => total + req.cantidad, 0);
    
    // Desgloses por ciudad para cada tipo
    const desgloseVehiculo = crearDesglosePorCiudad(req => !req.armado && !req.abordo);
    const desgloseArmados = crearDesglosePorCiudad(req => req.armado && !req.abordo);
    const desgloseAbordo = crearDesglosePorCiudad(req => req.abordo);
    const desgloseVehiculoArmado = crearDesglosePorCiudad(req => req.armado && !req.abordo);
    
    // Actualizar datos de requerimientos
    const updatedData = [
      {
        categoria: "Custodios con Vehículo",
        completados: custodiosVehiculo,
        objetivo: datosRequerimientos[0]?.objetivo || 50,
        porcentaje: Math.round((custodiosVehiculo / (datosRequerimientos[0]?.objetivo || 50)) * 100),
        color: "bg-blue-500",
        desglose: desgloseVehiculo
      },
      {
        categoria: "Custodios Armados",
        completados: custodiosArmados,
        objetivo: datosRequerimientos[1]?.objetivo || 30,
        porcentaje: Math.round((custodiosArmados / (datosRequerimientos[1]?.objetivo || 30)) * 100),
        color: "bg-amber-500",
        desglose: desgloseArmados
      },
      {
        categoria: "Custodios A Bordo",
        completados: custodiosAbordo,
        objetivo: datosRequerimientos[2]?.objetivo || 20,
        porcentaje: Math.round((custodiosAbordo / (datosRequerimientos[2]?.objetivo || 20)) * 100),
        color: "bg-green-500",
        desglose: desgloseAbordo
      },
      {
        categoria: "Custodios con Vehículo Armado",
        completados: custodiosVehiculoArmado,
        objetivo: datosRequerimientos[3]?.objetivo || 15,
        porcentaje: Math.round((custodiosVehiculoArmado / (datosRequerimientos[3]?.objetivo || 15)) * 100),
        color: "bg-purple-500",
        desglose: desgloseVehiculoArmado
      }
    ];
    
    setDatosRequerimientos(updatedData);
  }, [custodioRequirements, setDatosRequerimientos, datosRequerimientos]);

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
