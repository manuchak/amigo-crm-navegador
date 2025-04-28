
import { useState } from 'react';
import { toast } from "sonner";
import { downloadCsvTemplate } from '../../export/csvTemplateGenerator';

export function useTemplateDownload(type?: string) {
  const [isDownloading, setIsDownloading] = useState(false);
  
  const handleDownloadTemplate = () => {
    try {
      setIsDownloading(true);
      downloadCsvTemplate(type);
      toast.success("Plantilla descargada", {
        description: "La plantilla CSV ha sido descargada exitosamente."
      });
    } catch (error) {
      console.error("Error downloading template:", error);
      toast.error("Error al descargar plantilla", {
        description: "No se pudo descargar la plantilla CSV. Inténtelo nuevamente."
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
