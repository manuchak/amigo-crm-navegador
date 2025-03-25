
import React, { useState } from 'react';
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
}

interface CustodioRequirementsCardProps {
  requirements: CustodioRequirement[];
  ciudadesMexico: string[];
  mesesDelAnio: string[];
  currentMonth: string;
  onAddRequirement: (data: any) => void;
  onDeleteRequirement: (id: number) => void;
}

const CustodioRequirementsCard: React.FC<CustodioRequirementsCardProps> = ({
  requirements,
  ciudadesMexico,
  mesesDelAnio,
  currentMonth,
  onAddRequirement,
  onDeleteRequirement
}) => {
  const [openRequirementForm, setOpenRequirementForm] = useState(false);

  return (
    <Card className="shadow-sm mb-10">
      <CardHeader className="flex flex-row justify-between items-start">
        <div>
          <CardTitle>Requisitos de Custodios</CardTitle>
          <CardDescription>
            Gestione los requisitos de custodios por ciudad y mes
          </CardDescription>
        </div>
        <Dialog open={openRequirementForm} onOpenChange={setOpenRequirementForm}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Requisito
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agregar Nuevo Requisito de Custodios</DialogTitle>
              <DialogDescription>
                Complete la información requerida para crear un nuevo requisito de custodios
              </DialogDescription>
            </DialogHeader>
            <CustodioRequirementForm 
              onSubmit={(data) => {
                onAddRequirement(data);
                setOpenRequirementForm(false);
              }}
              ciudadesMexico={ciudadesMexico}
              mesesDelAnio={mesesDelAnio}
              defaultMonth={currentMonth}
            />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <CustodioRequirementsTable 
          requirements={requirements} 
          onDelete={onDeleteRequirement} 
        />
      </CardContent>
    </Card>
  );
};

export default CustodioRequirementsCard;
