
import { useState } from 'react';
import { toast } from "sonner";
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { templateColumns } from '../../export/columnDefinitions';
import { knownNumericColumns, knownBooleanColumns, knownTimeColumns, knownIntervalColumns } from '../lib/columnTypes';

interface UseTemplateDownloadResult {
  isDownloading: boolean;
  handleDownloadTemplate: () => void;
}

export function useTemplateDownload(templateType: 'servicios' | 'driver-behavior' = 'servicios'): UseTemplateDownloadResult {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadTemplate = async () => {
    setIsDownloading(true);
    
    try {
      // Create a new workbook
      const workbook = XLSX.utils.book_new();
      let headers: string[] = [];
      let descriptions: string[] = [];
      let formats: string[] = [];
      let exampleData: any[] = [];
      
      if (templateType === 'servicios') {
        // Get all columns from the templateColumns definition
        headers = templateColumns.map(col => col.name);
        descriptions = templateColumns.map(col => {
          const requiredText = col.required ? '[Requerido] ' : '[Opcional] ';
          return requiredText + (col.description || '');
        });
        
        // Add format information for different column types
        formats = templateColumns.map(col => {
          if (knownNumericColumns.includes(col.name)) {
            return "Número (ej: 123.45)";
          } else if (knownBooleanColumns.includes(col.name)) {
            return "Booleano (Sí/No, True/False)";
          } else if (knownTimeColumns.includes(col.name)) {
            return "Hora (HH:MM:SS o HH:MM)";
          } else if (knownIntervalColumns.includes(col.name)) {
            return "Intervalo (HH:MM:SS)";
          } else {
            return "";
          }
        });
        
        // Prepare example data row from the template definitions
        const exampleRow: Record<string, any> = {};
        templateColumns.forEach(col => {
          exampleRow[col.name] = col.example;
        });
        
        exampleData = [exampleRow];
      } else if (templateType === 'driver-behavior') {
        headers = [
          'Agrupación', 'Valoración', 'Multa', 'Cantidad', 
          'Duración', 'Kilometraje', 'Comienzo', 'Fin', 'Cliente'
        ];
        
        // Example data for driver behavior
        const today = new Date();
        const lastMonth = new Date(today);
        lastMonth.setMonth(today.getMonth() - 1);
        
        const formattedToday = format(today, 'yyyy-MM-dd', { locale: es });
        const formattedLastMonth = format(lastMonth, 'yyyy-MM-dd', { locale: es });
        
        exampleData = [
          {
            'Agrupación': 'Juan Pérez',
            'Valoración': 8.5,
            'Multa': 2,
            'Cantidad': 25,
            'Duración': '35:45:00',
            'Kilometraje': '1250 km',
            'Comienzo': formattedLastMonth,
            'Fin': formattedToday,
            'Cliente': 'Cliente Ejemplo'
          }
        ];
      }
      
      // Create worksheets
      const ws = XLSX.utils.json_to_sheet([]);
      
      // Add headers
      XLSX.utils.sheet_add_aoa(ws, [headers], { origin: 'A1' });
      
      // Add descriptions
      XLSX.utils.sheet_add_aoa(ws, [descriptions], { origin: 'A2' });
      
      // Add format information if available
      if (formats.some(f => f !== "")) {
        XLSX.utils.sheet_add_aoa(ws, [formats], { origin: 'A3' });
      }
      
      // Add example data
      if (exampleData.length > 0) {
        const exampleValues = Object.values(exampleData[0]);
        const startRow = formats.some(f => f !== "") ? 4 : 3;
        XLSX.utils.sheet_add_aoa(ws, [exampleValues], { origin: `A${startRow}` });
      }
      
      // Add instructions to a different sheet
      const instructionsWs = XLSX.utils.aoa_to_sheet([
        ['INSTRUCCIONES PARA LA IMPORTACIÓN DE DATOS'],
        [''],
        ['1. No modifique la estructura de columnas del archivo.'],
        ['2. Las columnas marcadas como [Requerido] son obligatorias.'],
        ['3. Los campos de tiempo (hora_presentacion, hora_inicio_custodia, hora_arribo, hora_finalizacion) pueden dejarse vacíos si no tiene la información.'],
        ['4. Los campos de intervalo (tiempo_retraso, tiempo_punto_origen, duracion_servicio, tiempo_estimado) también pueden dejarse vacíos.'],
        ['5. Formatos recomendados:'],
        ['   - Fechas y horas: YYYY-MM-DD HH:MM:SS o DD/MM/YYYY HH:MM:SS'],
        ['   - Horas: HH:MM:SS o HH:MM'],
        ['   - Intervalos: HH:MM:SS'],
        ['   - Valores booleanos: Sí/No, True/False, 1/0'],
        ['   - Números: Utilice punto como separador decimal (123.45)'],
        [''],
        ['6. Si un campo no tiene valor, puede dejarlo vacío o escribir NULL.'],
        ['7. Para campos de tiempo o intervalo vacíos, el sistema utilizará valores predeterminados (NULL o 00:00:00).']
      ]);
      
      // Add worksheets to workbook
      XLSX.utils.book_append_sheet(workbook, ws, "Plantilla");
      XLSX.utils.book_append_sheet(workbook, instructionsWs, "Instrucciones");
      
      // Generate filename with current date
      const date = format(new Date(), 'yyyyMMdd', { locale: es });
      const fileName = `plantilla_${templateType === 'servicios' ? 'servicios_custodia' : 'comportamiento_conduccion'}_${date}.xlsx`;
      
      // Generate and download the Excel file
      XLSX.writeFile(workbook, fileName);
      
      toast.success("Plantilla descargada", {
        description: "La plantilla ha sido descargada correctamente"
      });
    } catch (error) {
      console.error("Error al descargar la plantilla:", error);
      toast.error("Error al descargar la plantilla", {
        description: "Hubo un problema al generar la plantilla. Inténtelo nuevamente."
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return {
    isDownloading,
    handleDownloadTemplate
  };
}
