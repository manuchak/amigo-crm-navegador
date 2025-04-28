
import React, { useState } from 'react';
import { useFileImport } from '../services/import/hooks/useFileImport';
import { useTemplateDownload } from '../services/import/hooks/useTemplateDownload';
import { ImportProgressBar } from './ImportProgressBar';
import { ImportErrorDialog } from './ImportErrorDialog';
import { LargeFileWarningDialog } from './LargeFileWarningDialog';
import { ImportButtons } from './import/ImportButtons';

interface ServiceImportProps {
  className?: string;
}

export function ServiceImport({ className }: ServiceImportProps) {
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
    onShowErrorDialog: setShowErrorDialog
  });
  
  const {
    isDownloading,
    handleDownloadTemplate
  } = useTemplateDownload();

  return (
    <>
      <ImportButtons
        isUploading={isUploading}
        isDownloading={isDownloading}
        onFileSelected={handleFileSelected}
        onDownloadTemplate={handleDownloadTemplate}
        onCancelImport={handleCancelImport}
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
