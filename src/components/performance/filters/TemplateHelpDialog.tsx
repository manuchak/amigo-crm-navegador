
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { knownNumericColumns, knownTimeColumns, knownIntervalColumns, knownBooleanColumns } from '../services/import/lib/columnTypes';
import { templateColumns } from '../services/export/columnDefinitions';

interface TemplateHelpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templateType: string;
}

export function TemplateHelpDialog({ open, onOpenChange, templateType }: TemplateHelpDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Guía de importación de datos</DialogTitle>
          <DialogDescription>
            Información detallada sobre cómo preparar y cargar sus datos correctamente.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="general" className="mt-4">
          <TabsList>
            <TabsTrigger value="general">Instrucciones generales</TabsTrigger>
            <TabsTrigger value="columns">Campos y formatos</TabsTrigger>
            <TabsTrigger value="examples">Ejemplos</TabsTrigger>
            <TabsTrigger value="errors">Solución de errores</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-4 pt-4">
            <div className="space-y-2">
              <h3 className="font-medium">Proceso de importación</h3>
              <ul className="list-disc ml-6 space-y-2">
                <li>Descargue la plantilla desde el botón "Descargar Plantilla"</li>
                <li>Complete los datos siguiendo los formatos requeridos</li>
                <li>Guarde el archivo como Excel (.xlsx) o CSV (.csv)</li>
                <li>Haga clic en "Importar datos" y seleccione el archivo</li>
                <li>Revise los resultados y corrija errores si es necesario</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">Recomendaciones importantes</h3>
              <ul className="list-disc ml-6 space-y-2">
                <li>No modifique la estructura de columnas de la plantilla</li>
                <li>Asegúrese de completar todos los campos marcados como [Requerido]</li>
                <li>Los campos de tiempo y intervalos pueden dejarse en blanco si no tiene la información</li>
                <li>El sistema asignará valores predeterminados a campos vacíos cuando sea posible</li>
                <li>Para archivos grandes, el proceso puede tardar varios minutos</li>
              </ul>
            </div>
          </TabsContent>
          
          <TabsContent value="columns" className="space-y-4 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-medium mb-2">Campos requeridos</h3>
                  <ul className="list-disc ml-6 space-y-1">
                    {templateColumns
                      .filter(col => col.required)
                      .map((col, idx) => (
                        <li key={idx} className="text-sm">{col.name}: {col.description}</li>
                      ))
                    }
                  </ul>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-medium mb-2">Formatos de fecha y tiempo</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium">Fechas y horas:</p>
                      <p className="text-xs text-muted-foreground">YYYY-MM-DD HH:MM:SS o DD/MM/YYYY HH:MM:SS</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Tiempos:</p>
                      <p className="text-xs text-muted-foreground">HH:MM:SS o HH:MM <span className="text-green-600">(pueden dejarse en blanco)</span></p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Intervalos:</p>
                      <p className="text-xs text-muted-foreground">HH:MM:SS <span className="text-green-600">(pueden dejarse en blanco)</span></p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-medium mb-2">Campos numéricos</h3>
                  <ul className="list-disc ml-6 space-y-1 text-sm">
                    {knownNumericColumns.map((col, idx) => (
                      <li key={idx}>{col}</li>
                    ))}
                  </ul>
                  <p className="text-xs text-muted-foreground mt-2">Formato: Números con punto decimal (123.45)</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-medium mb-2">Campos de tiempo e intervalo</h3>
                  <p className="text-xs text-green-600 mb-2">
                    Los siguientes campos pueden dejarse en blanco y el sistema les asignará valores predeterminados:
                  </p>
                  <div className="grid grid-cols-2 gap-x-4">
                    <div>
                      <p className="text-sm font-medium">Campos de tiempo:</p>
                      <ul className="list-disc ml-6 space-y-1 text-xs">
                        {knownTimeColumns.map((col, idx) => (
                          <li key={idx}>{col}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Campos de intervalo:</p>
                      <ul className="list-disc ml-6 space-y-1 text-xs">
                        {knownIntervalColumns.map((col, idx) => (
                          <li key={idx}>{col}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="examples" className="space-y-4 pt-4">
            <div className="space-y-2">
              <h3 className="font-medium">Ejemplos de valores válidos</h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Tipo de campo</th>
                      <th className="text-left p-2">Ejemplos válidos</th>
                      <th className="text-left p-2">Notas</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-2">ID Servicio</td>
                      <td className="p-2">SERV-001, CUS-2025-001</td>
                      <td className="p-2">Identificador único del servicio</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2">Fecha y hora</td>
                      <td className="p-2">2025-04-15 14:30:00, 15/04/2025 14:30</td>
                      <td className="p-2">Formato YYYY-MM-DD HH:MM:SS o DD/MM/YYYY HH:MM:SS</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2">Tiempo</td>
                      <td className="p-2">14:30:00, 14:30, <span className="text-green-600">(vacío)</span></td>
                      <td className="p-2">Puede dejarse en blanco</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2">Intervalo</td>
                      <td className="p-2">01:30:00, 00:45:00, <span className="text-green-600">(vacío)</span></td>
                      <td className="p-2">Formato HH:MM:SS. Puede dejarse en blanco</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2">Numérico</td>
                      <td className="p-2">123.45, 1500, 0</td>
                      <td className="p-2">Usar punto como separador decimal</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2">Booleano</td>
                      <td className="p-2">Sí, No, true, false, 1, 0</td>
                      <td className="p-2">Valores que indican verdadero o falso</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="errors" className="space-y-4 pt-4">
            <div className="space-y-2">
              <h3 className="font-medium">Solución de problemas comunes</h3>
              
              <div className="space-y-3">
                <div className="p-3 border rounded-md">
                  <p className="font-medium">Error: "La columna X es requerida"</p>
                  <p className="text-sm text-muted-foreground">Asegúrese de que todos los campos marcados como [Requerido] tengan un valor.</p>
                </div>
                
                <div className="p-3 border rounded-md">
                  <p className="font-medium">Error: "Formato de fecha inválido"</p>
                  <p className="text-sm text-muted-foreground">Use el formato YYYY-MM-DD HH:MM:SS o DD/MM/YYYY HH:MM:SS para fechas y horas.</p>
                </div>
                
                <div className="p-3 border rounded-md">
                  <p className="font-medium">Error: "Valor numérico inválido"</p>
                  <p className="text-sm text-muted-foreground">Asegúrese de usar punto como separador decimal y no incluir símbolos como $ o %.</p>
                </div>
                
                <div className="p-3 border rounded-md">
                  <p className="font-medium">Los datos se importan pero algunos valores aparecen como NULL</p>
                  <p className="text-sm text-muted-foreground">
                    Para los campos de tiempo (hora_inicio_custodia, hora_arribo, etc.) y campos de intervalo (tiempo_punto_origen, etc.), el sistema 
                    permitirá valores vacíos. Estos se convertirán en NULL o valores predeterminados en la base de datos.
                  </p>
                </div>
                
                <div className="p-3 border rounded-md">
                  <p className="font-medium">Error durante la importación de archivos grandes</p>
                  <p className="text-sm text-muted-foreground">
                    Para archivos muy grandes (más de 10 MB), considere dividirlos en partes más pequeñas.
                    El proceso de importación puede tardar varios minutos dependiendo del tamaño del archivo.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
