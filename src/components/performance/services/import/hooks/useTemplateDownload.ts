
import { useState } from 'react';
import { toast } from "sonner";

interface UseTemplateDownloadResult {
  isDownloading: boolean;
  handleDownloadTemplate: () => void;
}

export function useTemplateDownload(templateType: 'servicios' | 'driver-behavior' = 'servicios'): UseTemplateDownloadResult {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadTemplate = async () => {
    setIsDownloading(true);
    
    try {
      let fileName: string;
      let headers: string[];
      let data: any[][];
      
      if (templateType === 'driver-behavior') {
        fileName = 'plantilla_comportamiento_conduccion.csv';
        headers = [
          'nombre_conductor', 
          'grupo_conductor', 
          'cliente', 
          'puntuacion', 
          'puntos_penalizacion', 
          'viajes', 
          'fecha_inicio', 
          'fecha_fin', 
          'distancia', 
          'tiempo_conduccion'
        ];
        
        // Ejemplo de datos
        const today = new Date();
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        
        data = [
          [
            'Juan Pérez', 
            'Grupo A', 
            'Cliente Ejemplo', 
            '85', 
            '12', 
            '25', 
            lastMonth.toISOString().split('T')[0], 
            today.toISOString().split('T')[0], 
            '1250.5', 
            '35h 45m'
          ]
        ];
      } else {
        fileName = 'plantilla_servicios_custodia.csv';
        headers = [
          'id_servicio', 
          'estado', 
          'nombre_cliente', 
          'nombre_custodio', 
          'fecha_hora_cita', 
          'origen', 
          'destino', 
          'tipo_servicio'
        ];
        
        // Ejemplo de datos
        data = [
          [
            'SRV-001', 
            'Completado', 
            'Cliente Ejemplo', 
            'Custodio Ejemplo', 
            '2023-01-15 09:00:00', 
            'Ciudad de México', 
            'Puebla', 
            'Transporte'
          ]
        ];
      }
      
      // Crear contenido CSV
      const csvContent = [
        headers.join(','),
        ...data.map(row => row.join(','))
      ].join('\n');
      
      // Crear blob y descargar
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      link.click();
      
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
