
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
import { importServiciosData } from './services/performanceDataService';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface PerformanceFilterProps {
  dateRange: DateRange;
  setDateRange: React.Dispatch<React.SetStateAction<DateRange>>;
}

export function PerformanceFilter({ dateRange, setDateRange }: PerformanceFilterProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [importErrors, setImportErrors] = useState<any[]>([]);
  const [showErrorDialog, setShowErrorDialog] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const result = await importServiciosData(file);
        
        if (!result.success && result.errors) {
          setImportErrors(result.errors);
          setShowErrorDialog(true);
        }
      } catch (error) {
        console.error("Error handling file upload:", error);
      } finally {
        setIsUploading(false);
        // Reset the file input value so the same file can be uploaded again if needed
        event.target.value = '';
      }
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
              <Button size="sm" variant="outline" className="whitespace-nowrap">
                Exportar datos
              </Button>
              <Button size="sm" className="whitespace-nowrap">
                Generar reporte
              </Button>
            </div>
          </div>
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
