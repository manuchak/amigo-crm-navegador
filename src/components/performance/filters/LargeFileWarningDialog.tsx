
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface LargeFileWarningDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedFile: File | null;
  onContinue: (file: File) => void;
}

export function LargeFileWarningDialog({ 
  open, 
  onOpenChange, 
  selectedFile, 
  onContinue 
}: LargeFileWarningDialogProps) {
  const handleContinue = () => {
    if (selectedFile) {
      onContinue(selectedFile);
    }
  };
  
  if (!selectedFile) return null;
  
  const fileSizeMB = (selectedFile.size / (1024 * 1024)).toFixed(1);
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-600">
            <AlertTriangle className="h-5 w-5" />
            Archivo grande detectado
          </DialogTitle>
          <DialogDescription>
            El archivo seleccionado ({fileSizeMB} MB) es grande y podría tardar varios minutos en procesarse.
          </DialogDescription>
        </DialogHeader>
        
        <div className="text-sm space-y-3 mt-2">
          <p>
            La importación de archivos grandes puede tener las siguientes limitaciones:
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>El tiempo de procesamiento puede ser considerable</li>
            <li>Mayor posibilidad de errores por limitaciones del servidor</li>
            <li>Posible interrupción por timeout si el proceso tarda demasiado</li>
          </ul>
          <p className="font-medium">
            Recomendaciones:
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>Considere dividir el archivo en partes más pequeñas</li>
            <li>No cierre esta ventana durante la importación</li>
            <li>Prepare una buena taza de café mientras espera ☕</li>
          </ul>
        </div>

        <DialogFooter className="mt-4 gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleContinue}>
            Continuar de todas formas
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
