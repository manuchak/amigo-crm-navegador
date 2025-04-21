
import React from 'react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  status: 'approved' | 'rejected';
  onConfirm: () => Promise<void>;
  loading: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ 
  open, 
  onOpenChange, 
  status, 
  onConfirm,
  loading
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {status === 'approved' ? 'Confirmar aprobación' : 'Confirmar rechazo'}
          </DialogTitle>
          <DialogDescription>
            {status === 'approved' 
              ? '¿Está seguro de aprobar este custodio? El custodio será marcado como calificado y pasará a la siguiente etapa del proceso.'
              : '¿Está seguro de rechazar este custodio? El custodio será marcado como rechazado.'}
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="flex space-x-2 justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={onConfirm}
            variant={status === 'approved' ? 'default' : 'destructive'}
            disabled={loading}
          >
            {status === 'approved' ? 'Aprobar' : 'Rechazar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
