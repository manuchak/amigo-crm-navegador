
import React from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { HelpCircle } from "lucide-react";
import { downloadCsvTemplate } from '../services/export/csvTemplateGenerator';

export function TemplateHelpDialog() {
  // Example columns to show in the help dialog
  const keyColumns = [
    { name: 'Nombre del Cliente', description: 'Nombre del cliente o empresa', required: true, example: 'Empresa ABC' },
    { name: 'Fecha de Servicio', description: 'Fecha en formato AAAA-MM-DD', required: true, example: '2023-05-15' },
    { name: 'Tipo de Servicio', description: 'Tipo de servicio', required: true, example: 'Escolta' },
    { name: 'Nombre del Custodio', description: 'Nombre completo del custodio', required: true, example: 'Juan Pérez' },
    { name: 'Origen', description: 'Ciudad de origen', required: true, example: 'Ciudad de México' },
    { name: 'Destino', description: 'Ciudad de destino', required: true, example: 'Guadalajara' },
    { name: 'KM Recorridos', description: 'Kilómetros recorridos', required: false, example: '450' },
    { name: 'Cobro al Cliente', description: 'Monto cobrado al cliente', required: false, example: '5000' },
    { name: 'Es Armado', description: 'Si el custodio va armado (si/no)', required: false, example: 'si' },
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <HelpCircle className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ayuda para Importación de Servicios</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">Instrucciones</h3>
            <ul className="list-disc ml-5 mt-2 space-y-1 text-sm">
              <li>Descargue la plantilla CSV para obtener un formato con las columnas correctas</li>
              <li>No modifique la estructura/nombres de las columnas</li>
              <li>Los campos marcados como requeridos son obligatorios</li>
              <li>Los campos numéricos no deben incluir símbolos de moneda o separadores de miles</li>
              <li>Las fechas deben estar en formato AAAA-MM-DD</li>
              <li>Los campos booleanos deben ser "si" o "no" (sin acentos)</li>
              <li>El tamaño máximo de archivo recomendado es 5MB</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-medium">Columnas Principales</h3>
            <div className="overflow-x-auto mt-2">
              <Table className="border">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-1/4">Columna</TableHead>
                    <TableHead className="w-1/4">Descripción</TableHead>
                    <TableHead className="w-1/6">Requerido</TableHead>
                    <TableHead className="w-1/3">Ejemplo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {keyColumns.map((column) => (
                    <TableRow key={column.name}>
                      <TableCell className="font-medium">{column.name}</TableCell>
                      <TableCell>{column.description}</TableCell>
                      <TableCell>{column.required ? 'Sí' : 'No'}</TableCell>
                      <TableCell className="font-mono">{column.example}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
          
          <div className="flex flex-col space-y-2">
            <h3 className="text-lg font-medium">Obtener Plantilla</h3>
            <p className="text-sm text-muted-foreground">
              Para asegurarse de tener el formato correcto, descargue la plantilla y use ese archivo como base para sus datos.
            </p>
            <div>
              <Button onClick={() => downloadCsvTemplate()}>
                Descargar Plantilla CSV
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
