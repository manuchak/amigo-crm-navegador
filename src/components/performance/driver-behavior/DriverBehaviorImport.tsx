
import React, { useState } from 'react';
import { useFileImport } from '../services/import/hooks/useFileImport';
import { useTemplateDownload } from '../services/import/hooks/useTemplateDownload';
import { ImportProgressBar } from '../filters/ImportProgressBar';
import { ImportErrorDialog } from '../filters/ImportErrorDialog';
import { LargeFileWarningDialog } from '../filters/LargeFileWarningDialog';
import { ImportButtons } from '../filters/import/ImportButtons';
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, Download } from 'lucide-react';

interface DriverBehaviorImportProps {
  className?: string;
  onImportComplete?: () => void;
}

export function DriverBehaviorImport({ className, onImportComplete }: DriverBehaviorImportProps) {
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  
  const {
    isUploading,
    uploadProgress,
    importErrors,
    importStatus,
    totalRows,
    processedRows,
    showLargeFileWarning,
    selectedFile,
    setShowLargeFileWarning,
    handleFileSelected,
    handleFileImport,
    handleCancelImport
  } = useFileImport({
    onShowErrorDialog: setShowErrorDialog,
    importType: 'driver-behavior', // Added importType to differentiate from servicios import
    onComplete: onImportComplete
  });
  
  const {
    isDownloading,
    handleDownloadTemplate
  } = useTemplateDownload('driver-behavior'); // Add support for driver behavior template
  
  return (
    <>
      <div className="flex items-center gap-3">
        <Button size="sm" variant="outline" onClick={handleDownloadTemplate} disabled={isDownloading} className="whitespace-nowrap gap-1">
          <Download className="h-4 w-4 mr-1" />
          Descargar Plantilla
        </Button>
        
        <input
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileSelected}
          className="hidden"
          id="driver-behavior-file-upload"
          disabled={isUploading}
        />
        
        <label htmlFor="driver-behavior-file-upload">
          <Button variant="outline" size="sm" className="whitespace-nowrap gap-1" asChild disabled={isUploading}>
            <span>
              <FileSpreadsheet className="h-4 w-4 mr-1" />
              Importar Datos
            </span>
          </Button>
        </label>
        
        {isUploading && (
          <Button size="sm" variant="destructive" onClick={handleCancelImport}>
            Cancelar
          </Button>
        )}
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
