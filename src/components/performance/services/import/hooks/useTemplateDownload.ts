
import { useState } from 'react';
import { toast } from "sonner";
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { templateColumns } from '../../export/columnDefinitions';

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
      let exampleData: any[] = [];
      
      if (templateType === 'servicios') {
        // Get all columns from the templateColumns definition
        headers = templateColumns.map(col => col.name);
        descriptions = templateColumns.map(col => {
          const requiredText = col.required ? '[Requerido] ' : '[Opcional] ';
          return requiredText + (col.description || '');
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
      
      // Create headers and descriptions worksheet
      const ws = XLSX.utils.json_to_sheet([]);
      XLSX.utils.sheet_add_aoa(ws, [headers], { origin: 'A1' });
      XLSX.utils.sheet_add_aoa(ws, [descriptions], { origin: 'A2' });
      
      // Add example data
      if (exampleData.length > 0) {
        const exampleValues = Object.values(exampleData[0]);
        XLSX.utils.sheet_add_aoa(ws, [exampleValues], { origin: 'A3' });
      }
      
      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, ws, "Template");
      
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
