import { useState } from 'react';
import { toast } from "sonner";
import * as XLSX from 'xlsx';

interface UseTemplateDownloadOptions {
  onError?: (error: any) => void;
}

export function useTemplateDownload(templateType: 'servicios' | 'driver-behavior' = 'servicios', options?: UseTemplateDownloadOptions) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadTemplate = async () => {
    setIsDownloading(true);
    try {
      // Create a new workbook
      const wb = XLSX.utils.book_new();
      let ws;
      
      if (templateType === 'driver-behavior') {
        // Headers for driver behavior template
        const headers = [
          'nombre_conductor', 'grupo_conductor', 'cliente', 'puntuacion', 
          'puntos_penalizacion', 'viajes', 'tiempo_conduccion', 
          'distancia', 'fecha_inicio', 'fecha_fin'
        ];
        
        // Sample data for driver behavior
        const sampleData = [
          [
            'Juan Pérez', 'Grupo A', 'Cliente 1', '85', 
            '12', '25', '120 min', 
            '350', '2025-04-01', '2025-04-30'
          ],
          [
            'María López', 'Grupo B', 'Cliente 2', '92', 
            '5', '18', '95 min', 
            '280', '2025-04-01', '2025-04-30'
          ],
          [
            'Carlos Ruiz', 'Grupo A', 'Cliente 1', '78', 
            '20', '30', '150 min', 
            '420', '2025-04-01', '2025-04-30'
          ]
        ];
        
        // Create worksheet with headers and sample data
        ws = XLSX.utils.aoa_to_sheet([headers, ...sampleData]);
        
        // Add descriptions and instructions in a separate sheet
        const instructionsData = [
          ['Campo', 'Descripción', 'Formato/Ejemplo'],
          ['nombre_conductor', 'Nombre completo del conductor', 'Texto: Juan Pérez'],
          ['grupo_conductor', 'Grupo o equipo al que pertenece el conductor', 'Texto: Grupo A'],
          ['cliente', 'Nombre del cliente para el que se realizó el servicio', 'Texto: Cliente ABC'],
          ['puntuacion', 'Calificación del conductor (0-100)', 'Número: 85'],
          ['puntos_penalizacion', 'Puntos de penalización acumulados', 'Número entero: 12'],
          ['viajes', 'Número de viajes realizados', 'Número entero: 25'],
          ['tiempo_conduccion', 'Tiempo total de conducción', 'Texto: 120 min'],
          ['distancia', 'Distancia total recorrida (km)', 'Número: 350'],
          ['fecha_inicio', 'Fecha de inicio del período', 'YYYY-MM-DD: 2025-04-01'],
          ['fecha_fin', 'Fecha de fin del período', 'YYYY-MM-DD: 2025-04-30']
        ];
        
        const instructionsSheet = XLSX.utils.aoa_to_sheet(instructionsData);
        XLSX.utils.book_append_sheet(wb, instructionsSheet, 'Instrucciones');
      } else {
        // Use existing servicios template (keep original code)
        const headers = [
          'nombre_cliente', 'folio_cliente', 'fecha_servicio', 
          'tipo_servicio', 'id_servicio', 'id_custodio', 'nombre_custodio'
        ];
        
        const sampleData = [
          [
            'Cliente Ejemplo', 'FOL-001', '2025-04-28', 
            'Custodia', 'SERV-123', 'CUST-456', 'Juan Pérez'
          ]
        ];
        
        ws = XLSX.utils.aoa_to_sheet([headers, ...sampleData]);
      }
      
      // Add the main worksheet to the workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Datos');

      // Get the template type for the filename
      const templateTypeName = templateType === 'driver-behavior' 
        ? 'comportamiento-conduccion' 
        : 'servicios-custodia';
      
      // Generate filename with date
      const date = new Date();
      const dateStr = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
      const filename = `plantilla-${templateTypeName}-${dateStr}.xlsx`;
      
      // Write and download the file
      XLSX.writeFile(wb, filename);
      
      toast.success("Plantilla descargada", {
        description: `Se ha descargado correctamente la plantilla para ${templateType === 'driver-behavior' ? 'comportamiento de conducción' : 'servicios de custodia'}`
      });
    } catch (error) {
      console.error("Error downloading template:", error);
      
      toast.error("Error al descargar plantilla", {
        description: "Ocurrió un error al generar la plantilla. Por favor intente nuevamente."
      });
      
      if (options?.onError) {
        options.onError(error);
      }
    } finally {
      setIsDownloading(false);
    }
  };

  return {
    isDownloading,
    handleDownloadTemplate
  };
}
