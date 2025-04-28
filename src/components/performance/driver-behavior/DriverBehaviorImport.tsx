
import React, { useState } from 'react';
import { useFileImport } from '../services/import/hooks/useFileImport';
import { useTemplateDownload } from '../services/import/hooks/useTemplateDownload';
import { ImportProgressBar } from '../filters/ImportProgressBar';
import { ImportErrorDialog } from '../filters/ImportErrorDialog';
import { LargeFileWarningDialog } from '../filters/LargeFileWarningDialog';
import { Button } from "@/components/ui/button";
import { RefreshCw, Download, Upload } from 'lucide-react';
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
      <div className="flex items-center gap-2">
        <Button 
          variant="outline"
          size="sm"
          onClick={handleRefreshData}
          className="h-9 px-3"
          title="Actualizar datos"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
        
        <Button 
          variant="default" 
          size="sm" 
          className="h-9"
          onClick={() => document.getElementById('driver-behavior-file-upload')?.click()}
          disabled={isUploading}
        >
          <Upload className="h-4 w-4 mr-2" />
          {isUploading ? "Subiendo..." : "Importar datos"}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleDownloadTemplate}
          disabled={isDownloading}
          className="h-9"
        >
          <Download className="h-4 w-4 mr-2" />
          Plantilla
        </Button>
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
