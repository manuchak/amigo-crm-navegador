
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileWarning } from "lucide-react";

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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileWarning className="h-5 w-5 text-yellow-600" />
            Archivo grande detectado
          </DialogTitle>
          <DialogDescription>
            Ha seleccionado un archivo de gran tamaño ({selectedFile ? (selectedFile.size / (1024 * 1024)).toFixed(2) : 0} MB). 
            La importación puede tardar varios minutos y consumir recursos significativos.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={() => {
              onOpenChange(false);
              if (selectedFile) {
                onContinue(selectedFile);
              }
            }}
          >
            Continuar con la importación
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
