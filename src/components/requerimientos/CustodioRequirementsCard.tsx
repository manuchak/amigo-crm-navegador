
import React, { useState, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import CustodioRequirementForm from './CustodioRequirementForm';
import CustodioRequirementsTable from './CustodioRequirementsTable';

interface CustodioRequirement {
  id: number;
  ciudad: string;
  mes: string;
  cantidad: number;
  armado: boolean;
  zona?: string;
  solicitante: string;
  fechaCreacion: string;
  procesado?: boolean;
}

interface CustodioRequirementsCardProps {
  requirements: CustodioRequirement[];
  ciudadesMexico: string[];
  mesesDelAnio: string[];
  currentMonth: string;
  onAddRequirement: (data: any) => void;
  onDeleteRequirement: (id: number) => void;
  onMarkProcessed: (id: number) => void;
}

// Header del card optimizado con React.memo
const CardHeaderMemo = React.memo(({ 
  title, 
  description, 
  openDialog 
}: { 
  title: string; 
  description: string; 
  openDialog: () => void 
}) => (
  <div className="flex flex-row justify-between items-start">
    <div>
      <CardTitle>{title}</CardTitle>
      <CardDescription>
        {description}
      </CardDescription>
    </div>
    <Button size="sm" onClick={openDialog}>
      <Plus className="h-4 w-4 mr-2" />
      Nuevo Requisito
    </Button>
  </div>
));

CardHeaderMemo.displayName = 'CardHeaderMemo';

// Componente principal optimizado con React.memo
const CustodioRequirementsCard = React.memo(({
  requirements,
  ciudadesMexico,
  mesesDelAnio,
  currentMonth,
  onAddRequirement,
  onDeleteRequirement,
  onMarkProcessed
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
        <CardHeaderMemo 
          title="Requisitos de Custodios" 
          description="Gestione los requisitos de custodios por ciudad y mes"
          openDialog={handleOpenDialog}
        />
      </CardHeader>
      <CardContent>
        <Dialog open={openRequirementForm} onOpenChange={handleOpenChange}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agregar Nuevo Requisito de Custodios</DialogTitle>
              <DialogDescription>
                Complete la información requerida para crear un nuevo requisito de custodios
              </DialogDescription>
            </DialogHeader>
            <CustodioRequirementForm 
              onSubmit={handleAddRequirement}
              ciudadesMexico={ciudadesMexico}
              mesesDelAnio={mesesDelAnio}
              defaultMonth={currentMonth}
            />
          </DialogContent>
        </Dialog>
        <CustodioRequirementsTable 
          requirements={requirements} 
          onDelete={onDeleteRequirement} 
          onMarkProcessed={onMarkProcessed}
        />
      </CardContent>
    </Card>
  );
});

CustodioRequirementsCard.displayName = 'CustodioRequirementsCard';

export default CustodioRequirementsCard;
