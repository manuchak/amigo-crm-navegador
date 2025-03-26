
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
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar registro de Lead</AlertDialogTitle>
          <AlertDialogDescription>
            {newLeadData && (
              <div className="space-y-2 mt-2">
                <p><strong>Nombre:</strong> {newLeadData.nombre}</p>
                <p><strong>Empresa:</strong> {newLeadData.empresa}</p>
                <p><strong>Contacto:</strong> {newLeadData.contacto}</p>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={onConfirm}>Confirmar</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default LeadConfirmDialog;
