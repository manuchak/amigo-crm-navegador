
import React, { useState, useEffect } from 'react';
import { format, subDays, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths, subYears, startOfQuarter, endOfQuarter } from 'date-fns';
import { es } from 'date-fns/locale';
import { Check, CalendarIcon, ChevronDown } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Type definitions
export interface DateRangeWithComparison {
  primary: {
    from: Date | null;
    to: Date | null;
  };
  comparison?: {
    from: Date | null;
    to: Date | null;
  };
  comparisonType: 'none' | 'previous' | 'year';
  rangeType: string;
}

// Preset date range options
const DATE_RANGE_PRESETS = [
  { id: 'today', label: 'Hoy', getRange: () => {
    const today = new Date();
    return { from: today, to: today };
  }},
  { id: 'yesterday', label: 'Ayer', getRange: () => {
    const yesterday = subDays(new Date(), 1);
    return { from: yesterday, to: yesterday };
  }},
  { id: 'last7days', label: 'Últimos 7 días', getRange: () => {
    return { from: subDays(new Date(), 6), to: new Date() };
  }},
  { id: 'last30days', label: 'Últimos 30 días', getRange: () => {
    return { from: subDays(new Date(), 29), to: new Date() };
  }},
  { id: 'thisMonth', label: 'Este mes', getRange: () => {
    const now = new Date();
    return { from: startOfMonth(now), to: now };
  }},
  { id: 'lastMonth', label: 'Mes pasado', getRange: () => {
    const now = new Date();
    const lastMonth = subMonths(now, 1);
    return { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) };
  }},
  { id: 'last90days', label: 'Últimos 90 días', getRange: () => {
    return { from: subDays(new Date(), 89), to: new Date() };
  }},
  { id: 'thisQuarter', label: 'Este trimestre', getRange: () => {
    const now = new Date();
    return { from: startOfQuarter(now), to: now };
  }},
  { id: 'lastQuarter', label: 'Trimestre pasado', getRange: () => {
    const now = new Date();
    const lastQuarter = subMonths(now, 3);
    return { from: startOfQuarter(lastQuarter), to: endOfQuarter(lastQuarter) };
  }},
  { id: 'ytd', label: 'Este año hasta hoy', getRange: () => {
    const now = new Date();
    return { from: startOfYear(now), to: now };
  }},
  { id: 'lastYear', label: 'Año pasado', getRange: () => {
    const lastYear = subYears(new Date(), 1);
    return { from: startOfYear(lastYear), to: endOfYear(lastYear) };
  }},
  { id: 'custom', label: 'Personalizado', getRange: () => {
    return { from: null, to: null };
  }},
];

interface AdvancedDateRangePickerProps {
  value: DateRangeWithComparison;
  onChange: (range: DateRangeWithComparison) => void;
  className?: string;
}

const AdvancedDateRangePicker: React.FC<AdvancedDateRangePickerProps> = ({ 
  value, 
  onChange,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [localValue, setLocalValue] = useState<DateRangeWithComparison>(value);
  const [isMobile, setIsMobile] = useState(false);
  
  // Check if screen is mobile size
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);
  
  // Sync with parent component value
  useEffect(() => {
    setLocalValue(value);
  }, [value]);
  
  // Format date range for display
  const formatDateRange = (from: Date | null, to: Date | null) => {
    if (!from) return "Seleccionar rango";
    
    if (from && to && from.getTime() === to.getTime()) {
      return format(from, "d MMM yyyy", { locale: es });
    }
    
    return `${from ? format(from, "d MMM", { locale: es }) : "?"} - ${to ? format(to, "d MMM yyyy", { locale: es }) : "?"}`;
  };

  // Get selected range name for display
  const getSelectedRangeName = () => {
    const preset = DATE_RANGE_PRESETS.find(p => p.id === localValue.rangeType);
    return preset ? preset.label : "Personalizado";
  };

  // Apply preset date range
  const applyPreset = (presetId: string) => {
    try {
      console.log(`Applying preset: ${presetId}`);
      const preset = DATE_RANGE_PRESETS.find(p => p.id === presetId);
      if (!preset) return;

      const primaryRange = preset.getRange();
      
      const newValue = {
        ...localValue,
        primary: primaryRange,
        rangeType: presetId
      };

      if (localValue.comparisonType !== 'none') {
        newValue.comparison = getComparisonRange(
          primaryRange.from, 
          primaryRange.to, 
          localValue.comparisonType
        );
      }

      console.log("New value after preset:", newValue);
      setLocalValue(newValue);
    } catch (error) {
      console.error("Error applying preset:", error);
    }
  };

  // Generate comparison date range based on primary range
  const getComparisonRange = (from: Date | null, to: Date | null, comparisonType: 'none' | 'previous' | 'year') => {
    if (!from || !to || comparisonType === 'none') {
      return undefined;
    }
    
    try {
      const diffDays = Math.round((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
      
      if (comparisonType === 'previous') {
        return {
          from: subDays(from, diffDays + 1),
          to: subDays(from, 1)
        };
      } else if (comparisonType === 'year') {
        return {
          from: subYears(from, 1),
          to: subYears(to, 1)
        };
      }
    } catch (error) {
      console.error("Error generating comparison range:", error);
    }
    
    return undefined;
  };

  // Handle comparison type change
  const handleComparisonChange = (type: 'none' | 'previous' | 'year') => {
    try {
      console.log(`Changing comparison type to: ${type}`);
      const newValue = {
        ...localValue,
        comparisonType: type
      };
      
      if (type !== 'none' && localValue.primary.from && localValue.primary.to) {
        newValue.comparison = getComparisonRange(
          localValue.primary.from,
          localValue.primary.to,
          type
        );
      } else {
        newValue.comparison = undefined;
      }
      
      console.log("New value after comparison change:", newValue);
      setLocalValue(newValue);
    } catch (error) {
      console.error("Error changing comparison type:", error);
    }
  };

  // Apply changes and close popover/dialog
  const applyChanges = () => {
    console.log("Applying changes:", localValue);
    onChange(localValue);
    setIsOpen(false);
    setIsDialogOpen(false);
  };

  // Cancel changes and close popover/dialog
  const cancelChanges = () => {
    setLocalValue(value);
    setIsOpen(false);
    setIsDialogOpen(false);
  };

  // Handle calendar date selection
  const handleCalendarSelect = (range: { from: Date | null; to: Date | null }) => {
    try {
      console.log("Calendar selection:", range);
      const newValue = {
        ...localValue,
        primary: range,
        rangeType: 'custom'
      };
      
      if (localValue.comparisonType !== 'none' && range.from && range.to) {
        newValue.comparison = getComparisonRange(range.from, range.to, localValue.comparisonType);
      }
      
      console.log("New value after calendar selection:", newValue);
      setLocalValue(newValue);
    } catch (error) {
      console.error("Error handling calendar selection:", error);
    }
  };
  
  // Render date picker content (shared between popover and dialog)
  const renderContent = () => (
    <div className="space-y-4">
      <div>
        <h4 className="mb-2 text-sm font-medium">Seleccionar periodo</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {DATE_RANGE_PRESETS.map((preset) => (
            <Button
              key={preset.id}
              variant={localValue.rangeType === preset.id ? "default" : "outline"}
              size="sm"
              className="justify-start"
              onClick={() => applyPreset(preset.id)}
            >
              <span className="truncate">{preset.label}</span>
              {localValue.rangeType === preset.id && (
                <Check className="w-4 h-4 ml-auto" />
              )}
            </Button>
          ))}
        </div>
      </div>
      
      {localValue.rangeType === 'custom' && (
        <div className="pt-2">
          <h4 className="mb-2 text-sm font-medium">Rango personalizado</h4>
          <div className="bg-white dark:bg-zinc-900 rounded-md overflow-hidden">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={localValue.primary.from || undefined}
              selected={localValue.primary}
              onSelect={handleCalendarSelect}
              numberOfMonths={isMobile ? 1 : 2}
              className={cn("p-3 pointer-events-auto bg-white dark:bg-zinc-900")}
            />
          </div>
        </div>
      )}

      <div className="pt-2 border-t">
        <h4 className="mb-2 text-sm font-medium">Opciones de comparación</h4>
        <div className="flex items-center justify-between">
          <span className="text-sm">Comparar con</span>
          <div className="flex items-center space-x-2">
            <Switch
              checked={localValue.comparisonType !== 'none'}
              onCheckedChange={(checked) => {
                handleComparisonChange(checked ? 'previous' : 'none');
              }}
            />
          </div>
        </div>

        {localValue.comparisonType !== 'none' && (
          <Select
            value={localValue.comparisonType}
            onValueChange={(value: any) => handleComparisonChange(value)}
          >
            <SelectTrigger className="mt-2 w-full bg-white dark:bg-zinc-900 border-gray-200 dark:border-gray-700">
              <SelectValue placeholder="Tipo de comparación" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-zinc-900 border-gray-200 dark:border-gray-700">
              <SelectItem value="previous">Periodo anterior</SelectItem>
              <SelectItem value="year">Mismo periodo año pasado</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  );

  // Mobile view uses Dialog component
  const renderMobileView = () => (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn("h-9 border-dashed flex items-center gap-2 min-w-[200px]", className)}
        >
          <CalendarIcon className="h-4 w-4" />
          <span className="text-sm truncate">{getSelectedRangeName()}: {formatDateRange(value.primary.from, value.primary.to)}</span>
          <ChevronDown className="w-4 h-4 ml-auto" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white dark:bg-zinc-900 border-gray-200 dark:border-gray-700 p-4 max-w-md max-h-[85vh] overflow-y-auto" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Seleccionar rango de fechas</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          {renderContent()}
        </div>
        <DialogFooter className="flex justify-end gap-2 pt-2 border-t">
          <Button variant="outline" onClick={cancelChanges}>Cancelar</Button>
          <Button onClick={applyChanges}>Aplicar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  // Desktop view uses Popover component
  const renderDesktopView = () => (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn("h-9 border-dashed flex items-center gap-2 min-w-[200px]", className)}
        >
          <CalendarIcon className="h-4 w-4" />
          <span className="text-sm truncate">{getSelectedRangeName()}: {formatDateRange(value.primary.from, value.primary.to)}</span>
          <ChevronDown className="w-4 h-4 ml-auto" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-auto p-4 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-700 shadow-lg z-50" 
        align="start"
        sideOffset={4}
      >
        {renderContent()}
        <div className="flex justify-end gap-2 pt-4 mt-4 border-t">
          <Button variant="outline" onClick={cancelChanges} size="sm">Cancelar</Button>
          <Button onClick={applyChanges} size="sm">Aplicar</Button>
        </div>
      </PopoverContent>
    </Popover>
  );

  return (
    <>
      {isMobile ? renderMobileView() : renderDesktopView()}
    </>
  );
};

export default AdvancedDateRangePicker;
