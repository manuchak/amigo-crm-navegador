import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DownloadIcon, UploadIcon, XIcon } from 'lucide-react';
import { importServiciosData } from '../services/import/importService';
import { downloadCsvTemplate } from '../services/export/csvTemplateGenerator';
import { ImportProgressBar } from './ImportProgressBar';
import { ImportErrorDialog } from './ImportErrorDialog';
import { LargeFileWarningDialog } from './LargeFileWarningDialog';
import { TemplateHelpDialog } from './TemplateHelpDialog';
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

  const handleDownloadTemplate = () => {
    try {
      downloadCsvTemplate();
      toast.success("Plantilla descargada", {
        description: "La plantilla CSV ha sido descargada exitosamente."
      });
    } catch (error) {
      console.error("Error downloading template:", error);
      toast.error("Error al descargar plantilla", {
        description: "No se pudo descargar la plantilla CSV. Inténtelo nuevamente."
      });
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
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <label htmlFor="servicios-file-upload">
                <Button variant="outline" size="sm" className="whitespace-nowrap gap-1" asChild disabled={isUploading}>
                  <span>
                    {isUploading ? (
                      <>Importando...</>
                    ) : (
                      <>
                        <UploadIcon className="h-4 w-4 mr-1" />
                        Importar Servicios (CSV/Excel)
                      </>
                    )}
                  </span>
                </Button>
              </label>
            </TooltipTrigger>
            <TooltipContent>
              <p>Importar datos de servicios desde un archivo CSV o Excel</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        {isUploading && (
          <Button size="sm" variant="destructive" onClick={handleCancelImport} className="whitespace-nowrap gap-1">
            <XIcon className="h-4 w-4 mr-1" />
            Cancelar
          </Button>
        )}
        
        <div className="flex items-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="whitespace-nowrap gap-1"
                  onClick={handleDownloadTemplate}
                >
                  <DownloadIcon className="h-4 w-4 mr-1" />
                  Descargar Plantilla CSV
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Descargar plantilla CSV con formato correcto para importación</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TemplateHelpDialog />
        </div>
        
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
