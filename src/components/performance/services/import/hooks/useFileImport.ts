
import { useState } from 'react';
import { toast } from "sonner";
import { importServiciosData } from '../../import/importService';
import { ImportResponse } from '../../import/types';

interface UseFileImportOptions {
  onShowErrorDialog: (show: boolean) => void;
}

export function useFileImport({ onShowErrorDialog }: UseFileImportOptions) {
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
    
    setSelectedFile(file);
    
    if (file.size > 5 * 1024 * 1024) {
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
      const result = await importServiciosData(file, (status, processed, total) => {
        setImportStatus(status);
        if (total > 0) {
          setTotalRows(total);
          setProcessedRows(processed);
          const progress = Math.min(95, Math.floor((processed / total) * 95));
          setUploadProgress(progress);
        }
      });

      if (result.success) {
        setImportStatus('¡Importación completada!');
        setUploadProgress(100);
        
        if (result.errors?.length > 0) {
          setImportErrors(result.errors);
          setTimeout(() => onShowErrorDialog(true), 1000);
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
      console.error("Error handling file upload:", error);
      setImportStatus('Error en la importación');
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
      setAbortController(null);
      setSelectedFile(null);
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
