
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
          'Agrupación', 
          'Valoración', 
          'Multa', 
          'Cantidad', 
          'Duración', 
          'Kilometraje', 
          'Comienzo', 
          'Fin', 
          'Cliente'
        ];
        
        // Ejemplo de datos con formato correcto para mejor comprensión del usuario
        const today = new Date();
        const lastMonth = new Date(today);
        lastMonth.setMonth(today.getMonth() - 1);
        
        const formattedToday = today.toISOString().split('T')[0];
        const formattedLastMonth = lastMonth.toISOString().split('T')[0];
        
        data = [
          [
            'Grupo A', 
            '8.5', 
            '120', 
            '25', 
            '35:45:00', 
            '1250 km', 
            `${formattedLastMonth} 09:00`,
            `${formattedToday} 18:00`, 
            'Cliente Ejemplo'
          ],
          [
            'Grupo B',
            '9.2',
            '50',
            '18',
            '28:15:00',
            '980 km',
            `${formattedLastMonth} 10:30`,
            `${formattedToday} 17:15`,
            'Cliente Demo'
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
          ],
          [
            'SRV-002',
            'Pendiente',
            'Cliente Demo',
            'Custodio Demo',
            '2023-02-20 14:30:00',
            'Guadalajara',
            'León',
            'Escolta'
          ]
        ];
      }
      
      // Crear contenido CSV con BOM para compatibilidad con Excel
      const BOM = '\uFEFF';
      const csvContent = BOM + [
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
