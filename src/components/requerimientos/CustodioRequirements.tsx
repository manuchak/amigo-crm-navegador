
import React from 'react';
import { Card } from '@/components/ui/card';
import { useRequerimientos } from './RequerimientosContext';
import CustodioRequirementsCard from './CustodioRequirementsCard';

const CustodioRequirements = () => {
  const {
    custodioRequirements,
    ciudadesMexico,
    mesesDelAnio,
    mesActual,
    agregarRequisitosCustodios,
    eliminarRequisitosCustodios,
    actualizarEstadoCustodio
  } = useRequerimientos();

  // Memoizar el mes actual para evitar recálculos
  const currentMonth = React.useMemo(() => mesesDelAnio[mesActual], [mesesDelAnio, mesActual]);

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
