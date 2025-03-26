
import React from 'react';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from '@/components/ui/button';
import { Lead } from '@/context/LeadsContext';

interface LeadConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newLeadData: Lead | null;
  onConfirm: () => void;
}

const LeadConfirmDialog: React.FC<LeadConfirmDialogProps> = ({ 
  open, 
  onOpenChange, 
  newLeadData, 
  onConfirm 
}) => {
  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar registro de Lead</AlertDialogTitle>
          <AlertDialogDescription>
            ¿Estás seguro de que deseas registrar este lead?
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        {newLeadData && (
          <div className="space-y-2 my-4 text-sm">
            <div><strong>Nombre:</strong> {newLeadData.nombre}</div>
            <div><strong>Empresa:</strong> {newLeadData.empresa}</div>
            <div><strong>Contacto:</strong> {newLeadData.contacto}</div>
          </div>
        )}
        
        <AlertDialogFooter>
          <Button variant="outline" onClick={handleCancel}>Cancelar</Button>
          <Button onClick={onConfirm}>Confirmar</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default LeadConfirmDialog;
