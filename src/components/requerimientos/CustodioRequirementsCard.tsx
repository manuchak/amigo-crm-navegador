
import React, { useState, useCallback } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import CustodioRequirementsTable from './CustodioRequirementsTable';
import CustodioRequirementDialog from './CustodioRequirementDialog';
import CustodioRequirementsHeader from './CustodioRequirementsHeader';
import { CustodioRequirement } from './types';

interface CustodioRequirementsCardProps {
  requirements: CustodioRequirement[];
  ciudadesMexico: string[];
  mesesDelAnio: string[];
  currentMonth: string;
  onAddRequirement: (data: any) => void;
  onDeleteRequirement: (id: number) => void;
  onUpdateEstado: (id: number, estado: 'solicitado' | 'recibido' | 'aceptado') => void;
}

const CustodioRequirementsCard = React.memo(({
  requirements,
  ciudadesMexico,
  mesesDelAnio,
  currentMonth,
  onAddRequirement,
  onDeleteRequirement,
  onUpdateEstado
}: CustodioRequirementsCardProps) => {
  const [openRequirementForm, setOpenRequirementForm] = useState(false);

  const handleOpenChange = useCallback((open: boolean) => {
    setOpenRequirementForm(open);
  }, []);

  const handleAddRequirement = useCallback((data: any) => {
    onAddRequirement(data);
    setOpenRequirementForm(false);
  }, [onAddRequirement]);

  const handleOpenDialog = useCallback(() => {
    setOpenRequirementForm(true);
  }, []);

  return (
    <Card className="shadow-sm mb-10">
      <CardHeader>
        <CustodioRequirementsHeader 
          title="Requisitos de Custodios" 
          description="Gestione los requisitos de custodios por ciudad y mes"
          onAddNew={handleOpenDialog}
        />
      </CardHeader>
      <CardContent>
        <CustodioRequirementDialog
          open={openRequirementForm}
          onOpenChange={handleOpenChange}
          onSubmit={handleAddRequirement}
          ciudadesMexico={ciudadesMexico}
          mesesDelAnio={mesesDelAnio}
          defaultMonth={currentMonth}
        />
        <CustodioRequirementsTable 
          requirements={requirements} 
          onDelete={onDeleteRequirement} 
          onUpdateEstado={onUpdateEstado}
        />
      </CardContent>
    </Card>
  );
});

CustodioRequirementsCard.displayName = 'CustodioRequirementsCard';

export default CustodioRequirementsCard;
