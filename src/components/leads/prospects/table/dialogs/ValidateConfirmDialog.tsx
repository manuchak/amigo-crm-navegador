
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Prospect } from '@/services/prospectService';

interface ValidateConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prospect: Prospect;
  onConfirm: () => void;
}

const ValidateConfirmDialog: React.FC<ValidateConfirmDialogProps> = ({
  open,
  onOpenChange,
  prospect,
  onConfirm,
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar validación</AlertDialogTitle>
          <AlertDialogDescription>
            ¿Está seguro que desea validar a <span className="font-medium">{prospect.lead_name || prospect.custodio_name || 'este prospecto'}</span>? 
            Esta acción cambiará el estado del prospecto a "Validado" y no podrá ser visualizado en la lista de prospectos.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className="bg-green-600 hover:bg-green-700"
          >
            Confirmar validación
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ValidateConfirmDialog;
