
import React, { useState } from 'react';
import { useFileImport } from '../services/import/hooks/useFileImport';
import { useTemplateDownload } from '../services/import/hooks/useTemplateDownload';
import { ImportProgressBar } from '../filters/ImportProgressBar';
import { ImportErrorDialog } from '../filters/ImportErrorDialog';
import { LargeFileWarningDialog } from '../filters/LargeFileWarningDialog';
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, Download, RefreshCw } from 'lucide-react';
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface DriverBehaviorImportProps {
  className?: string;
  onImportComplete?: () => void;
}

export function DriverBehaviorImport({ className, onImportComplete }: DriverBehaviorImportProps) {
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const queryClient = useQueryClient();
  
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
    importType: 'driver-behavior',
    onComplete: () => {
      // Invalidate queries to refresh data after import
      queryClient.invalidateQueries({ queryKey: ['driver-behavior-data'] });
      queryClient.invalidateQueries({ queryKey: ['driver-behavior-clients'] });
      
      if (onImportComplete) {
        onImportComplete();
      }
      
      toast.success("Datos importados correctamente", {
        description: "El dashboard ha sido actualizado con los nuevos datos"
      });
    }
  });
  
  const {
    isDownloading,
    handleDownloadTemplate
  } = useTemplateDownload('driver-behavior');
  
  const handleRefreshData = () => {
    queryClient.invalidateQueries({ queryKey: ['driver-behavior-data'] });
    queryClient.invalidateQueries({ queryKey: ['driver-behavior-clients'] });
    toast.success("Datos actualizados", {
      description: "El dashboard ha sido actualizado"
    });
  };
  
  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
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
        
        <Button size="sm" variant="outline" onClick={handleRefreshData} className="whitespace-nowrap gap-1">
          <RefreshCw className="h-4 w-4 mr-1" />
          Actualizar Datos
        </Button>
        
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
