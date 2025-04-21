
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

interface SuccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  status: 'approved' | 'rejected';
  lifetimeId?: string;
  onComplete: () => void;
}

export const SuccessDialog: React.FC<SuccessDialogProps> = ({ 
  open, 
  onOpenChange, 
  status,
  lifetimeId,
  onComplete
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {status === 'approved' ? 'Custodio Aprobado' : 'Custodio Rechazado'}
          </DialogTitle>
          <DialogDescription>
            {status === 'approved' 
              ? 'El custodio ha sido aprobado y pasado a la siguiente etapa del proceso.'
              : 'El custodio ha sido marcado como rechazado.'}
          </DialogDescription>
        </DialogHeader>
        
        {lifetimeId && (
          <div className="my-4 p-4 bg-muted rounded-md">
            <h4 className="text-sm font-medium mb-2">Identificador Permanente del Custodio:</h4>
            <p className="text-lg font-bold tracking-wider text-center p-2 bg-background rounded border">
              {lifetimeId}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Este identificador es único y permanente para este custodio en el sistema.
            </p>
          </div>
        )}
        
        <DialogFooter>
          <Button onClick={onComplete}>
            Entendido
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
