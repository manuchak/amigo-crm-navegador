
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface PerformanceFilterProps {
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
}

export function PerformanceFilter({ dateRange, setDateRange }: PerformanceFilterProps) {
  return (
    <Card className="border-0 shadow-md bg-white/90">
      <CardContent className="p-4 flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm text-muted-foreground">Filtros:</span>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 border-dashed flex gap-2">
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
                onSelect={setDateRange}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline">
            Exportar datos
          </Button>
          <Button size="sm">
            Generar reporte
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
