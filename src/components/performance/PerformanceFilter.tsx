
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
import { AlertCircle, FileWarning } from "lucide-react";
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
  const [showLargeFileWarning, setShowLargeFileWarning] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      
      // Mostrar advertencia si el archivo es mayor a 5 MB
      if (file.size > 5 * 1024 * 1024) {
        setShowLargeFileWarning(true);
      } else {
        handleImportFile(file);
      }
    }
  };

  const handleImportFile = async (file: File) => {
    // Cancelar cualquier importación en curso
    if (abortController) {
      abortController.abort();
    }
    
    // Crear un nuevo controlador de aborto para esta importación
    const newAbortController = new AbortController();
    setAbortController(newAbortController);
    
    setIsUploading(true);
    setUploadProgress(5); // Comenzar progress
    setImportStatus('Analizando archivo...');
    setImportErrors([]);
    setShowLargeFileWarning(false);
    
    try {
      const result = await importServiciosData(
        file, 
        // Progress callback con informes de estado mejorados
        (status, processed, total) => {
          setImportStatus(status);
          
          if (total > 0) {
            setTotalRows(total);
            setProcessedRows(processed);
            
            // Calcular progreso con ponderación - el procesamiento toma más tiempo que la validación
            let calculatedProgress;
            
            if (status.includes("validando") || status.includes("Validando") || status.includes("Extrayendo")) {
              // La validación es 0-30% del progreso total
              calculatedProgress = Math.min(30, Math.floor((processed / total) * 30));
            } else if (status.includes("Preparando")) {
              calculatedProgress = 35;
            } else {
              // La importación es 35-95% del progreso total
              if (processed === 0) {
                calculatedProgress = 35; // Mantener en 35% si aún no ha comenzado a procesar
              } else {
                calculatedProgress = 35 + Math.min(60, Math.floor((processed / total) * 60));
              }
            }
            
            setUploadProgress(calculatedProgress);
          }
        }
      );
      
      if (result.success) {
        setImportStatus('¡Importación completada!');
        setUploadProgress(100);
        
        // Si hay errores parciales pero la importación fue exitosa
        if (result.errors && result.errors.length > 0) {
          setImportErrors(result.errors);
          setTimeout(() => {
            setShowErrorDialog(true);
          }, 1000);
        }
      } else {
        setImportStatus('Error en la importación');
        if (result.errors && result.errors.length > 0) {
          setImportErrors(result.errors);
          setShowErrorDialog(true);
        }
        setUploadProgress(0);
      }
      
      setTimeout(() => {
        if (result.success) {
          // Mantener el mensaje de éxito más tiempo para archivos grandes
          const delay = result.totalCount && result.totalCount > 10000 ? 5000 : 3000;
          setTimeout(() => {
            setUploadProgress(0);
            setImportStatus('');
            setIsUploading(false);
          }, delay);
        } else {
          setIsUploading(false);
        }
      }, 1000);
      
    } catch (error) {
      console.error("Error handling file upload:", error);
      setImportStatus('Error en la importación');
      setUploadProgress(0);
      setIsUploading(false);
    } finally {
      setAbortController(null);
      setSelectedFile(null);
    }
  };

  // Agregar una función para cancelar la importación
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
                onChange={handleFileSelected}
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

      {/* Diálogo de advertencia para archivos grandes */}
      <Dialog open={showLargeFileWarning} onOpenChange={setShowLargeFileWarning}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileWarning className="h-5 w-5 text-yellow-600" />
              Archivo grande detectado
            </DialogTitle>
            <DialogDescription>
              Ha seleccionado un archivo de gran tamaño ({selectedFile ? (selectedFile.size / (1024 * 1024)).toFixed(2) : 0} MB). 
              La importación puede tardar varios minutos y consumir recursos significativos.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setShowLargeFileWarning(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={() => {
                setShowLargeFileWarning(false);
                if (selectedFile) {
                  handleImportFile(selectedFile);
                }
              }}
            >
              Continuar con la importación
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Diálogo de errores */}
      <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Errores de importación</DialogTitle>
            <DialogDescription>
              {importErrors.length > 0 && uploadProgress === 100 
                ? "Se completó la importación pero se encontraron algunos errores. Los registros con errores no fueron importados."
                : "Se encontraron errores en la importación. Por favor revise los detalles y vuelva a intentar."}
            </DialogDescription>
          </DialogHeader>
          
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Se encontraron {importErrors.length} errores</AlertTitle>
            <AlertDescription>
              {uploadProgress === 100 
                ? "Algunos registros no se importaron correctamente. Revise los detalles a continuación."
                : "Los datos no se importaron. Corrija los errores y vuelva a intentarlo."}
            </AlertDescription>
          </Alert>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted">
                  <th className="p-2 text-left">Lote/Fila</th>
                  <th className="p-2 text-left">Error</th>
                </tr>
              </thead>
              <tbody>
                {importErrors.map((error, index) => (
                  <tr key={index} className="border-b border-muted">
                    <td className="p-2">{error.batch ? `Lote ${error.batch}` : error.row ? `Fila ${error.row}` : `Error ${index + 1}`}</td>
                    <td className="p-2 text-destructive">
                      {error.message}
                      {error.details && (
                        <div className="text-xs text-gray-600 mt-1">
                          Detalles: {error.details}
                        </div>
                      )}
                    </td>
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
