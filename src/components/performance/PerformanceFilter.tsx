
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Input } from "@/components/ui/input";
import { importServiciosData } from './services/import/importService';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface PerformanceFilterProps {
  dateRange: DateRange;
  setDateRange: React.Dispatch<React.SetStateAction<DateRange>>;
}

export function PerformanceFilter({ dateRange, setDateRange }: PerformanceFilterProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [importErrors, setImportErrors] = useState<any[]>([]);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [importStatus, setImportStatus] = useState('');
  const [totalRows, setTotalRows] = useState(0);
  const [processedRows, setProcessedRows] = useState(0);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Cancel any ongoing import
      if (abortController) {
        abortController.abort();
      }
      
      // Create a new abort controller for this import
      const newAbortController = new AbortController();
      setAbortController(newAbortController);
      
      setIsUploading(true);
      setUploadProgress(5); // Start progress
      setImportStatus('Analizando archivo...');
      setImportErrors([]);
      
      try {
        const result = await importServiciosData(
          file, 
          // Progress callback with improved status reporting
          (status, processed, total) => {
            setImportStatus(status);
            
            if (total > 0) {
              setTotalRows(total);
              setProcessedRows(processed);
              
              // Calculate progress with weighting - processing takes more time than validation
              let calculatedProgress;
              
              if (status.includes("validando") || status.includes("Validando")) {
                // Validation is 0-40% of the total progress
                calculatedProgress = Math.min(40, Math.floor((processed / total) * 40));
              } else {
                // Importing is 40-95% of the total progress
                calculatedProgress = 40 + Math.min(55, Math.floor((processed / total) * 55));
              }
              
              setUploadProgress(calculatedProgress);
            }
          }
        );
        
        if (result.success) {
          setImportStatus('¡Importación completada!');
          setUploadProgress(100);
        } else {
          setImportStatus('Error en la importación');
          if (result.errors && result.errors.length > 0) {
            setImportErrors(result.errors);
            setShowErrorDialog(true);
          }
          setUploadProgress(0);
        }
        
        // Reset the file input value so the same file can be uploaded again if needed
        event.target.value = '';
        
        setTimeout(() => {
          if (result.success) {
            setUploadProgress(0);
            setImportStatus('');
          }
        }, 3000); // Keep success message visible for 3 seconds
        
      } catch (error) {
        console.error("Error handling file upload:", error);
        setImportStatus('Error en la importación');
        setUploadProgress(0);
      } finally {
        setIsUploading(false);
        setAbortController(null);
        // Reset the file input value
        event.target.value = '';
      }
    }
  };

  // Add a cancel import function
  const handleCancelImport = () => {
    if (abortController) {
      abortController.abort();
      setImportStatus('Importación cancelada');
      setUploadProgress(0);
      setIsUploading(false);
      setAbortController(null);
    }
  };

  return (
    <>
      <Card className="border-0 shadow-md bg-white/90">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="font-medium text-sm text-muted-foreground whitespace-nowrap">Filtros:</span>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9 border-dashed flex items-center gap-2 min-w-[200px]">
                    <Calendar className="h-4 w-4" />
                    {dateRange.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "d MMM", { locale: es })} -{" "}
                          {format(dateRange.to, "d MMM, yyyy", { locale: es })}
                        </>
                      ) : (
                        format(dateRange.from, "d MMM, yyyy", { locale: es })
                      )
                    ) : (
                      <span>Seleccionar fechas</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange.from}
                    selected={dateRange}
                    onSelect={setDateRange as (range: DateRange | undefined) => void}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex items-center gap-3">
              <Input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
                id="servicios-file-upload"
                disabled={isUploading}
              />
              <label htmlFor="servicios-file-upload">
                <Button variant="outline" size="sm" className="whitespace-nowrap" asChild disabled={isUploading}>
                  <span>{isUploading ? "Importando..." : "Importar Servicios"}</span>
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
          </div>
          
          {/* Enhanced upload progress bar with more detailed status */}
          {uploadProgress > 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>{importStatus}</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
              
              {totalRows > 0 && (
                <div className="text-xs text-muted-foreground mt-1 flex justify-between">
                  <span>Procesando {processedRows} de {totalRows} registros</span>
                  {isUploading && (
                    <button 
                      onClick={handleCancelImport}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Cancelar importación
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Errores de importación</DialogTitle>
            <DialogDescription>
              Se encontraron errores en los siguientes registros del archivo Excel. Por favor corrija los errores y vuelva a cargar el archivo.
            </DialogDescription>
          </DialogHeader>
          
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Se encontraron {importErrors.length} errores</AlertTitle>
            <AlertDescription>
              Los datos no se importaron. Corrija los errores y vuelva a intentarlo.
            </AlertDescription>
          </Alert>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted">
                  <th className="p-2 text-left">Fila</th>
                  <th className="p-2 text-left">Error</th>
                </tr>
              </thead>
              <tbody>
                {importErrors.map((error, index) => (
                  <tr key={index} className="border-b border-muted">
                    <td className="p-2">{error.row}</td>
                    <td className="p-2 text-destructive">{error.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
