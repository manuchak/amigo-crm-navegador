
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DownloadIcon } from "lucide-react";

export interface TemplateHelpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templateType: string;
}

export function TemplateHelpDialog({ open, onOpenChange, templateType }: TemplateHelpDialogProps) {
  // Helper function to determine which content to show based on template type
  const getTemplateFields = () => {
    if (templateType === 'driver-behavior') {
      return [
        { field: 'Agrupación', description: 'Nombre del conductor o grupo', required: true, example: 'Juan Pérez' },
        { field: 'Valoración', description: 'Puntuación de 0 a 10', required: true, example: '8.5' },
        { field: 'Multa', description: 'Puntos de penalización', required: false, example: '2' },
        { field: 'Cantidad', description: 'Número de viajes', required: true, example: '35' },
        { field: 'Kilometraje', description: 'Distancia total recorrida', required: true, example: '450 km' },
        { field: 'Duración', description: 'Tiempo total de conducción', required: false, example: '8h 30m' },
        { field: 'Cliente', description: 'Nombre del cliente', required: true, example: 'Empresa ABC' },
        { field: 'Comienzo', description: 'Fecha de inicio del período', required: true, example: '2025-01-01' },
        { field: 'Fin', description: 'Fecha de fin del período', required: true, example: '2025-01-31' }
      ];
    } else {
      return [
        { field: 'Campo 1', description: 'Descripción del campo 1', required: true, example: 'Ejemplo 1' },
        { field: 'Campo 2', description: 'Descripción del campo 2', required: false, example: 'Ejemplo 2' }
      ];
    }
  };

  const handleDownloadTemplate = () => {
    // Logic to download template would go here
    console.log(`Downloading ${templateType} template...`);
    // You can implement actual download functionality here
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Formato de plantilla para {templateType === 'driver-behavior' ? 'Comportamiento de Conducción' : 'importación'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">Instrucciones</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Para importar datos correctamente, su archivo debe seguir esta estructura. 
              Puede descargar una plantilla para comenzar.
            </p>
            <Button 
              variant="outline" 
              className="mt-2" 
              onClick={handleDownloadTemplate}
            >
              <DownloadIcon className="h-4 w-4 mr-2" />
              Descargar plantilla
            </Button>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Campos requeridos</h3>
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campo</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Requerido</TableHead>
                    <TableHead>Ejemplo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getTemplateFields().map((field, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{field.field}</TableCell>
                      <TableCell>{field.description}</TableCell>
                      <TableCell>{field.required ? 'Sí' : 'No'}</TableCell>
                      <TableCell className="font-mono text-xs">{field.example}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium">Notas adicionales</h3>
            <ul className="list-disc list-inside text-sm space-y-1 mt-1 text-muted-foreground">
              <li>Los archivos CSV deben usar coma (,) como separador</li>
              <li>Las fechas deben estar en formato YYYY-MM-DD</li>
              <li>Se recomienda no exceder los 1000 registros por importación</li>
              <li>Los valores con comas deben estar entre comillas dobles</li>
              <li>La primera fila debe contener los nombres de las columnas</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
