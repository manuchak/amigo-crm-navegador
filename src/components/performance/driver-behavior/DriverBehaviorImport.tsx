
import React, { useState } from 'react';
import { useFileImport } from '../services/import/hooks/useFileImport';
import { useTemplateDownload } from '../services/import/hooks/useTemplateDownload';
import { ImportProgressBar } from '../filters/ImportProgressBar';
import { ImportErrorDialog } from '../filters/ImportErrorDialog';
import { LargeFileWarningDialog } from '../filters/LargeFileWarningDialog';
import { Button } from "@/components/ui/button";
import { Upload, DownloadIcon } from 'lucide-react';
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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

  const { isDownloading, handleDownloadTemplate } = useTemplateDownload();
  
  return (
    <>
      <div className="flex gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="default" 
                size="sm" 
                className="h-9"
                onClick={() => document.getElementById('driver-behavior-file-upload')?.click()}
                disabled={isUploading}
              >
                <Upload className="h-4 w-4 mr-2" />
                {isUploading ? "Importando..." : "Importar datos"}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Importar datos desde archivo Excel o CSV</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-9"
                onClick={handleDownloadTemplate}
                disabled={isDownloading}
              >
                <DownloadIcon className="h-4 w-4 mr-2" />
                Plantilla
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Descargar plantilla de importación</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <input
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={handleFileSelected}
        className="hidden"
        id="driver-behavior-file-upload"
        disabled={isUploading}
      />
      
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
