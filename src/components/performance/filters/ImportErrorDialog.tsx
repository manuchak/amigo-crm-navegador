
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface ImportErrorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  importErrors: any[];
  uploadProgress: number;
}

export function ImportErrorDialog({ open, onOpenChange, importErrors, uploadProgress }: ImportErrorDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Errores de importación</DialogTitle>
          <DialogDescription>
            {importErrors.length > 0 && uploadProgress === 100 
              ? "Se completó la importación pero se encontraron algunos errores. Los registros con errores no fueron importados."
              : "Se encontraron errores en la importación. Por favor revise los detalles y vuelva a intentar."}
          </DialogDescription>
        </DialogHeader>
        
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Se encontraron {importErrors.length} errores</AlertTitle>
          <AlertDescription>
            {uploadProgress === 100 
              ? "Algunos registros no se importaron correctamente. Revise los detalles a continuación."
              : "Los datos no se importaron. Corrija los errores y vuelva a intentarlo."}
          </AlertDescription>
        </Alert>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-muted">
                <th className="p-2 text-left">Lote/Fila</th>
                <th className="p-2 text-left">Error</th>
              </tr>
            </thead>
            <tbody>
              {importErrors.map((error, index) => (
                <tr key={index} className="border-b border-muted">
                  <td className="p-2">{error.batch ? `Lote ${error.batch}` : error.row ? `Fila ${error.row}` : `Error ${index + 1}`}</td>
                  <td className="p-2 text-destructive">
                    {error.message}
                    {error.details && (
                      <div className="text-xs text-gray-600 mt-1">
                        Detalles: {error.details}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
