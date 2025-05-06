
import React, { useState } from 'react';
import { DateRange } from 'react-day-picker';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { datePresets } from './config/datePresets';

interface PerformanceDateFilterProps {
  dateRange: DateRange;
  comparisonRange?: DateRange;
  onDateChange: (range: DateRange, comparisonRange?: DateRange) => void;
  showComparison?: boolean;
}

export function PerformanceDateFilter({
  dateRange,
  comparisonRange,
  onDateChange,
  showComparison = false
}: PerformanceDateFilterProps) {
  const [open, setOpen] = useState(false);
  
  // Formatear la fecha para mostrar en el botón
  const formatDateRange = (range: DateRange) => {
    if (!range.from) return 'Seleccionar fecha';
    if (!range.to) return format(range.from, 'PP', { locale: es });
    return `${format(range.from, 'dd MMM', { locale: es })} - ${format(range.to, 'dd MMM', { locale: es })}`;
  };

  // Aplicar un preset de fecha
  const applyPreset = (preset: { value: string; from: Date; to: Date }) => {
    let newComparisonRange;
    
    // Si se muestra la comparación, crear un rango para comparar
    if (showComparison && comparisonRange) {
      const daysInRange = Math.floor((preset.to.getTime() - preset.from.getTime()) / (1000 * 60 * 60 * 24));
      const comparisonEnd = new Date(preset.from);
      comparisonEnd.setDate(comparisonEnd.getDate() - 1);
      const comparisonStart = new Date(comparisonEnd);
      comparisonStart.setDate(comparisonStart.getDate() - daysInRange);
      
      newComparisonRange = {
        from: comparisonStart,
        to: comparisonEnd
      };
    }
    
    onDateChange({ from: preset.from, to: preset.to }, newComparisonRange);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="justify-start text-left font-normal h-9 px-3 bg-background">
          <CalendarIcon className="mr-2 h-4 w-4" />
          <span>{formatDateRange(dateRange)}</span>
          {showComparison && comparisonRange && comparisonRange.from && (
            <span className="ml-2 text-muted-foreground"> vs {formatDateRange(comparisonRange)}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-3 border-b">
          <Tabs defaultValue="presets">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="presets">Preestablecidos</TabsTrigger>
              <TabsTrigger value="custom">Personalizado</TabsTrigger>
            </TabsList>
            
            <div className="mt-3">
              <TabContent value="presets">
                <div className="grid grid-cols-2 gap-2">
                  {datePresets.map((preset) => (
                    <Button
                      key={preset.value}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        applyPreset(preset);
                        setOpen(false);
                      }}
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
              </TabContent>
              
              <TabContent value="custom">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-1">Período principal</p>
                    <Calendar
                      mode="range"
                      selected={dateRange}
                      onSelect={(range) => {
                        if (range) onDateChange(range, comparisonRange);
                      }}
                      numberOfMonths={2}
                      defaultMonth={dateRange.from}
                    />
                  </div>
                  
                  {showComparison && (
                    <div>
                      <p className="text-sm font-medium mb-1">Período de comparación</p>
                      <Calendar
                        mode="range"
                        selected={comparisonRange}
                        onSelect={(range) => {
                          if (range) onDateChange(dateRange, range);
                        }}
                        numberOfMonths={2}
                        defaultMonth={comparisonRange?.from}
                      />
                    </div>
                  )}
                  
                  <div className="flex justify-end">
                    <Button 
                      size="sm"
                      onClick={() => setOpen(false)}
                    >
                      Aplicar
                    </Button>
                  </div>
                </div>
              </TabContent>
            </div>
          </Tabs>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Componente auxiliar para las pestañas de contenido
function TabContent({ 
  value, 
  children 
}: { 
  value: string; 
  children: React.ReactNode 
}) {
  return (
    <div data-tab={value} className="py-2">
      {children}
    </div>
  );
}
