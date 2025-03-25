
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import CustodioRequirementForm from './CustodioRequirementForm';

interface CustodioRequirementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  ciudadesMexico: string[];
  mesesDelAnio: string[];
  defaultMonth: string;
}

const CustodioRequirementDialog = React.memo(({
  open,
  onOpenChange,
  onSubmit,
  ciudadesMexico,
  mesesDelAnio,
  defaultMonth
}: CustodioRequirementDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agregar Nuevo Requisito de Custodios</DialogTitle>
          <DialogDescription>
            Complete la información requerida para crear un nuevo requisito de custodios
          </DialogDescription>
        </DialogHeader>
        <CustodioRequirementForm 
          onSubmit={onSubmit}
          ciudadesMexico={ciudadesMexico}
          mesesDelAnio={mesesDelAnio}
          defaultMonth={defaultMonth}
        />
      </DialogContent>
    </Dialog>
  );
});

CustodioRequirementDialog.displayName = 'CustodioRequirementDialog';

export default CustodioRequirementDialog;
