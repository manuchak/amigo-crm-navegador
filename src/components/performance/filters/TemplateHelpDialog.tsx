
import React, { useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DownloadIcon } from "lucide-react";
import { templateColumns } from '../services/export/columnDefinitions';
import { useTemplateDownload } from '../services/import/hooks/useTemplateDownload';

export interface TemplateHelpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templateType: 'servicios' | 'driver-behavior';
}

export function TemplateHelpDialog({ open, onOpenChange, templateType }: TemplateHelpDialogProps) {
  const { isDownloading, handleDownloadTemplate } = useTemplateDownload(templateType);
  
  // Get essential fields for the selected template type
  const essentialFields = useMemo(() => {
    if (templateType === 'servicios') {
      // Get the required fields from templateColumns
      return templateColumns.filter(col => col.required);
    } else if (templateType === 'driver-behavior') {
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
    }
    return [];
  }, [templateType]);

  // Get optional fields (first 10 max)
  const optionalFields = useMemo(() => {
    if (templateType === 'servicios') {
      // Get some non-required fields from templateColumns (limited to first 10)
      return templateColumns.filter(col => !col.required).slice(0, 10);
    }
    return [];
  }, [templateType]);

  const getFieldsData = () => {
    if (templateType === 'servicios') {
      return [
        ...essentialFields.map(field => ({
          field: field.displayName,
          description: field.description || '',
          required: 'Sí',
          example: field.example
        })),
        ...optionalFields.map(field => ({
          field: field.displayName,
          description: field.description || '',
          required: 'No',
          example: field.example
        }))
      ];
    } else {
      return essentialFields.map(field => ({
        field: field.field,
        description: field.description,
        required: field.required ? 'Sí' : 'No',
        example: field.example
      }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Formato de plantilla para {
              templateType === 'driver-behavior' ? 'Comportamiento de Conducción' : 
              'Servicios de Custodia'
            }
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">Instrucciones</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Para importar datos correctamente, su archivo debe seguir esta estructura. 
              El archivo puede estar en formato Excel (.xlsx) o CSV (.csv).
            </p>
            <Button 
              variant="outline" 
              className="mt-2" 
              onClick={handleDownloadTemplate}
              disabled={isDownloading}
            >
              <DownloadIcon className="h-4 w-4 mr-2" />
              {isDownloading ? "Descargando..." : "Descargar plantilla"}
            </Button>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Campos principales</h3>
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
                  {getFieldsData().map((field, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{field.field}</TableCell>
                      <TableCell>{field.description}</TableCell>
                      <TableCell>{field.required}</TableCell>
                      <TableCell className="font-mono text-xs">{field.example}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {templateType === 'servicios' && (
              <p className="text-sm text-muted-foreground mt-2">
                * La plantilla completa contiene {templateColumns.length} campos. Descargue la plantilla para ver todos los campos disponibles.
              </p>
            )}
          </div>

          <div>
            <h3 className="text-lg font-medium">Notas adicionales</h3>
            <ul className="list-disc list-inside text-sm space-y-1 mt-1 text-muted-foreground">
              <li>Los archivos CSV deben usar coma (,) como separador</li>
              <li>Las fechas deben estar en formato YYYY-MM-DD o DD/MM/YYYY</li>
              <li>Los campos de fecha y hora deben estar en formato YYYY-MM-DD HH:MM:SS</li>
              <li>Los valores con comas deben estar entre comillas dobles</li>
              <li>La primera fila debe contener los nombres de las columnas</li>
              {templateType === 'servicios' && (
                <>
                  <li>Si existe un registro con el mismo ID de servicio, se actualizará en lugar de crear uno nuevo</li>
                  <li>Los campos requeridos son obligatorios para cada registro nuevo</li>
                </>
              )}
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
