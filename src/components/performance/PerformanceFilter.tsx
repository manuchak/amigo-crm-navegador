
import React from 'react';
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

interface PerformanceFilterProps {
  dateRange: DateRange;
  setDateRange: React.Dispatch<React.SetStateAction<DateRange>>;
}

export function PerformanceFilter({ dateRange, setDateRange }: PerformanceFilterProps) {
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        await importServiciosData(file);
      } catch (error) {
        console.error("Error handling file upload:", error);
      }
    }
  };

  return (
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
            />
            <label htmlFor="servicios-file-upload">
              <Button variant="outline" size="sm" className="whitespace-nowrap" asChild>
                <span>Importar Servicios</span>
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
  );
}
