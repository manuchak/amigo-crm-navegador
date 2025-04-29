
import { useState } from 'react';
import { toast } from "sonner";
import * as XLSX from 'xlsx';

export function useTemplateDownload() {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadTemplate = async () => {
    setIsDownloading(true);
    try {
      // Create a simple template workbook
      const workbook = XLSX.utils.book_new();
      
      // Define the header row
      const headers = [
        'id_servicio', 'fecha_hora_cita', 'id_custodio', 'nombre_custodio', 'estado',
        'nombre_cliente', 'ruta', 'origen', 'destino', 'km_recorridos', 'cobro_cliente'
      ];
      
      // Add a description row
      const descriptions = [
        'ID único del servicio', 'Fecha y hora de la cita (YYYY-MM-DD HH:MM:SS)', 
        'ID del custodio', 'Nombre completo del custodio', 'Estado del servicio (Completado, Cancelado, etc.)',
        'Nombre del cliente', 'Descripción de la ruta', 'Lugar de origen', 'Lugar de destino',
        'Kilómetros recorridos', 'Monto cobrado al cliente'
      ];
      
      // Add an example row
      const exampleData = [
        'SERV-001', '2025-04-30 10:00:00', '1234', 'Juan Pérez López', 'Completado',
        'Empresa ABC', 'Ciudad de México - Puebla', 'CDMX, México', 'Puebla, México', 
        '120', '3500'
      ];
      
      // Create worksheet with headers and example
      const wsData = [headers, descriptions, exampleData];
      
      // Create a worksheet
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      
      // Add the worksheet to the workbook
      XLSX.utils.book_append_sheet(workbook, ws, "Plantilla");
      
      // Generate the Excel file
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      
      // Convert to Blob
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'plantilla_servicios.xlsx';
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success("Plantilla descargada", {
        description: "Se ha descargado la plantilla para importación de servicios"
      });
    } catch (error) {
      console.error("Error downloading template:", error);
      toast.error("Error al descargar la plantilla", {
        description: error instanceof Error ? error.message : "Error desconocido"
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
