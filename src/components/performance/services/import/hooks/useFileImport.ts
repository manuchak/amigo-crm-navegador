
import { useState } from 'react';
import { toast } from "sonner";
import { ImportResponse } from '../types';
import { importServiciosData } from '../importService';

interface UseFileImportOptions {
  onShowErrorDialog: (show: boolean) => void;
  importType?: 'servicios' | 'driver-behavior';
  onComplete?: () => void;
}

export function useFileImport({ 
  onShowErrorDialog, 
  importType = 'servicios',
  onComplete 
}: UseFileImportOptions) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [importErrors, setImportErrors] = useState<any[]>([]);
  const [importStatus, setImportStatus] = useState('');
  const [totalRows, setTotalRows] = useState(0);
  const [processedRows, setProcessedRows] = useState(0);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [showLargeFileWarning, setShowLargeFileWarning] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    console.log(`File selected for ${importType} import:`, file.name);
    setSelectedFile(file);
    
    // Check if file is large (> 5MB)
    const MAX_SIZE_MB = 5;
    const maxSizeBytes = MAX_SIZE_MB * 1024 * 1024;
    
    if (file.size > maxSizeBytes) {
      setShowLargeFileWarning(true);
    } else {
      handleFileImport(file);
    }
  };

  const handleFileImport = async (file: File) => {
    if (abortController) {
      abortController.abort();
    }
    
    const newAbortController = new AbortController();
    setAbortController(newAbortController);
    
    setIsUploading(true);
    setUploadProgress(5);
    setImportStatus('Analizando archivo...');
    setImportErrors([]);
    setShowLargeFileWarning(false);

    try {
      console.log(`Starting import for type: ${importType}`);
      
      const result = await importServiciosData(file, (status, processed, total) => {
        setImportStatus(status);
        if (total > 0) {
          setTotalRows(total);
          setProcessedRows(processed);
          const progress = Math.min(95, Math.floor((processed / total) * 95));
          setUploadProgress(progress);
        }
      });

      console.log(`Import result for ${importType}:`, result);
      if (result.success) {
        setImportStatus('¡Importación completada!');
        setUploadProgress(100);
        
        if (result.errors?.length > 0) {
          setImportErrors(result.errors);
          setTimeout(() => onShowErrorDialog(true), 1000);
        } else {
          toast.success("Importación exitosa", {
            description: `Los datos han sido importados correctamente.`
          });
          
          if (onComplete) {
            setTimeout(onComplete, 2000);
          }
        }
      } else {
        setImportStatus('Error en la importación');
        if (result.errors?.length > 0) {
          setImportErrors(result.errors);
          onShowErrorDialog(true);
        }
        setUploadProgress(0);
      }
    } catch (error) {
      console.error(`Error handling ${importType} file upload:`, error);
      setImportStatus('Error en la importación');
      setUploadProgress(0);
      
      toast.error("Error en la importación", {
        description: error instanceof Error ? error.message : "Error desconocido al procesar el archivo"
      });
    } finally {
      setIsUploading(false);
      setAbortController(null);
      // No reiniciamos selectedFile para poder mostrar el mensaje de error si es necesario
    }
  };

  const handleCancelImport = () => {
    if (abortController) {
      abortController.abort();
      setImportStatus('Importación cancelada');
      setUploadProgress(0);
      setIsUploading(false);
      setAbortController(null);
      setSelectedFile(null);
      
      toast.info("Importación cancelada", {
        description: "La importación de datos ha sido cancelada"
      });
    }
  };

  return {
    isUploading,
    uploadProgress,
    importErrors,
    importStatus,
    totalRows,
    processedRows,
    showLargeFileWarning,
    selectedFile,
    setImportErrors,
    setShowLargeFileWarning,
    handleFileSelected,
    handleFileImport,
    handleCancelImport
  };
}
