
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { UploadIcon } from "lucide-react";
import { ImportProgressBar } from "../filters/ImportProgressBar";
import { ImportErrorDialog } from "../filters/ImportErrorDialog";
import { LargeFileWarningDialog } from "../filters/LargeFileWarningDialog";
import { TemplateHelpDialog } from "../filters/TemplateHelpDialog";
import { importDriverBehaviorData } from '../services/driverBehavior/importService';
import { ImportResponse } from '../services/import/types';
import { toast } from 'sonner';

interface DriverBehaviorImportProps {
  onImportComplete?: () => void;
}

export function DriverBehaviorImport({ onImportComplete }: DriverBehaviorImportProps) {
  const [isImporting, setIsImporting] = useState(false);
  const [showFileDialog, setShowFileDialog] = useState(false);
  const [progress, setProgress] = useState({ status: '', percent: 0 });
  const [importErrors, setImportErrors] = useState<ImportResponse | null>(null);
  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [showHelpDialog, setShowHelpDialog] = useState(false);
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check if file is too large (> 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setCurrentFile(file);
      setShowWarningDialog(true);
      return;
    }
    
    processFile(file);
  };
  
  const processFile = async (file: File) => {
    setIsImporting(true);
    setProgress({ status: 'Iniciando importación...', percent: 0 });
    
    try {
      const result = await importDriverBehaviorData(
        file,
        (status, processed, total) => {
          const percent = Math.round((processed / total) * 100);
          setProgress({ status, percent });
        }
      );
      
      if (result.success) {
        toast.success('Importación completada', {
          description: result.message
        });
        if (onImportComplete) {
          onImportComplete();
        }
      } else {
        console.error('Import errors:', result);
        setImportErrors(result);
      }
    } catch (error) {
      console.error('Error during import:', error);
      toast.error('Error en la importación', {
        description: 'Ha ocurrido un error durante el proceso de importación'
      });
    } finally {
      setIsImporting(false);
      setShowFileDialog(false);
      setCurrentFile(null);
    }
  };
  
  const handleContinueWithLargeFile = () => {
    setShowWarningDialog(false);
    if (currentFile) {
      processFile(currentFile);
    }
  };
  
  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFileDialog(true)}
          className="h-9"
        >
          <UploadIcon className="w-4 h-4 mr-2" />
          Importar Datos
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowHelpDialog(true)}
          className="h-9 w-9 rounded-full"
        >
          ?
        </Button>
      </div>
      
      {/* File Selection Dialog */}
      <Dialog open={showFileDialog} onOpenChange={setShowFileDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Importar Datos de Comportamiento</DialogTitle>
            <DialogDescription>
              Seleccione un archivo CSV con datos de comportamiento de conducción para importar.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col gap-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                id="file-upload"
                className="hidden"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileSelect}
                disabled={isImporting}
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer text-blue-500 hover:text-blue-700"
              >
                {isImporting ? (
                  <span>Importando archivo...</span>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <UploadIcon className="h-8 w-8" />
                    <span>Haga clic para seleccionar un archivo CSV</span>
                    <span className="text-xs text-gray-500">
                      o arrastre y suelte aquí
                    </span>
                  </div>
                )}
              </label>
            </div>
            
            {isImporting && (
              <ImportProgressBar 
                importStatus={progress.status}
                uploadProgress={progress.percent}
                totalRows={0}
                processedRows={0}
                isUploading={isImporting}
                onCancel={() => {}}
              />
            )}
            
            <div className="text-xs text-gray-500">
              <p>Formatos soportados: CSV, Excel (.xlsx, .xls)</p>
              <p>Tamaño máximo recomendado: 5MB</p>
              <p>
                <Button variant="link" className="p-0 h-auto text-xs" onClick={() => setShowHelpDialog(true)}>
                  Ver información sobre el formato esperado
                </Button>
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Warning dialog for large files */}
      <LargeFileWarningDialog
        open={showWarningDialog}
        onOpenChange={setShowWarningDialog}
        selectedFile={currentFile}
        onContinue={handleContinueWithLargeFile}
      />
      
      {/* Help dialog for template format */}
      <TemplateHelpDialog
        open={showHelpDialog}
        onOpenChange={setShowHelpDialog}
        templateType="driver-behavior"
      />
      
      {/* Error dialog */}
      {importErrors && (
        <ImportErrorDialog
          open={!!importErrors}
          onOpenChange={() => setImportErrors(null)}
          importErrors={importErrors.errors || []}
          uploadProgress={100}
        />
      )}
    </>
  );
}
