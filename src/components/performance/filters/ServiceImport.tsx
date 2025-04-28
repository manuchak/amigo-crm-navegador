
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { importServiciosData } from '../services/import/importService';
import { ImportProgressBar } from './ImportProgressBar';
import { ImportErrorDialog } from './ImportErrorDialog';
import { LargeFileWarningDialog } from './LargeFileWarningDialog';

interface ServiceImportProps {
  className?: string;
}

export function ServiceImport({ className }: ServiceImportProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [importErrors, setImportErrors] = useState<any[]>([]);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
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
          setTimeout(() => setShowErrorDialog(true), 1000);
        }
      } else {
        setImportStatus('Error en la importación');
        if (result.errors?.length > 0) {
          setImportErrors(result.errors);
          setShowErrorDialog(true);
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

  return (
    <>
      <div className="flex items-center gap-3">
        <Input
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileSelected}
          className="hidden"
          id="servicios-file-upload"
          disabled={isUploading}
        />
        <label htmlFor="servicios-file-upload">
          <Button variant="outline" size="sm" className="whitespace-nowrap" asChild disabled={isUploading}>
            <span>{isUploading ? "Importando..." : "Importar Servicios (CSV/Excel)"}</span>
          </Button>
        </label>
        {isUploading && (
          <Button size="sm" variant="destructive" onClick={handleCancelImport} className="whitespace-nowrap">
            Cancelar
          </Button>
        )}
        <Button size="sm" variant="outline" className="whitespace-nowrap">
          Exportar datos
        </Button>
        <Button size="sm" className="whitespace-nowrap">
          Generar reporte
        </Button>
      </div>
      
      <ImportProgressBar 
        importStatus={importStatus}
        uploadProgress={uploadProgress}
        totalRows={totalRows}
        processedRows={processedRows}
        isUploading={isUploading}
        onCancel={handleCancelImport}
      />

      <LargeFileWarningDialog 
        open={showLargeFileWarning} 
        onOpenChange={setShowLargeFileWarning}
        selectedFile={selectedFile}
        onContinue={handleFileImport}
      />

      <ImportErrorDialog 
        open={showErrorDialog} 
        onOpenChange={setShowErrorDialog}
        importErrors={importErrors}
        uploadProgress={uploadProgress}
      />
    </>
  );
}
