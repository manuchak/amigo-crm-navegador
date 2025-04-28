import React, { useState, useEffect } from 'react';
import { format, subDays, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths, subYears, startOfQuarter, endOfQuarter } from 'date-fns';
import { es } from 'date-fns/locale';
import { Check, CalendarIcon, ChevronDown } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

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
  const [localValue, setLocalValue] = useState<DateRangeWithComparison>(value);
  
  useEffect(() => {
    setLocalValue(value);
  }, [value]);
  
  const formatDateRange = (from: Date | null, to: Date | null) => {
    if (!from) return "Seleccionar rango";
    
    if (from && to && from.getTime() === to.getTime()) {
      return format(from, "d MMM yyyy", { locale: es });
    }
    
    return `${from ? format(from, "d MMM", { locale: es }) : "?"} - ${to ? format(to, "d MMM yyyy", { locale: es }) : "?"}`;
  };

  const getSelectedRangeName = () => {
    const preset = DATE_RANGE_PRESETS.find(p => p.id === localValue.rangeType);
    return preset ? preset.label : "Personalizado";
  };

  const applyPreset = (presetId: string) => {
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

    setLocalValue(newValue);
  };

  const getComparisonRange = (from: Date | null, to: Date | null, comparisonType: 'none' | 'previous' | 'year') => {
    if (!from || !to || comparisonType === 'none') {
      return undefined;
    }
    
    const diffDays = from && to ? Math.round((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)) : 0;
    
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
    
    return undefined;
  };

  const handleComparisonChange = (type: 'none' | 'previous' | 'year') => {
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
    
    setLocalValue(newValue);
  };

  const applyChanges = () => {
    onChange(localValue);
    setIsOpen(false);
  };

  const cancelChanges = () => {
    setLocalValue(value);
    setIsOpen(false);
  };

  const handleCalendarSelect = (range: { from: Date | null; to: Date | null }) => {
    const newValue = {
      ...localValue,
      primary: range,
      rangeType: 'custom'
    };
    
    if (localValue.comparisonType !== 'none' && range.from && range.to) {
      newValue.comparison = getComparisonRange(range.from, range.to, localValue.comparisonType);
    }
    
    setLocalValue(newValue);
  };

  const renderMobileSheetContent = () => (
    <div className="px-1 py-4 space-y-6">
      {renderContent()}
      <div className="flex justify-end gap-2 pt-2 border-t">
        <Button variant="outline" onClick={cancelChanges}>Cancelar</Button>
        <Button onClick={applyChanges}>Aplicar</Button>
      </div>
    </div>
  );

  const renderContent = () => (
    <>
      <div className="space-y-4">
        <div>
          <h4 className="mb-2 text-sm font-medium">Seleccionar periodo</h4>
          <div className="grid grid-cols-2 gap-2">
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
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={localValue.primary.from || undefined}
              selected={localValue.primary}
              onSelect={handleCalendarSelect}
              numberOfMonths={2}
              className={cn("p-3 pointer-events-auto")}
            />
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
              <SelectTrigger className="mt-2 w-full">
                <SelectValue placeholder="Tipo de comparación" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="previous">Periodo anterior</SelectItem>
                <SelectItem value="year">Mismo periodo año pasado</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>
    </>
  );

  const renderMobileView = () => (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn("h-9 border-dashed flex items-center gap-2 min-w-[200px]", className)}
        >
          <CalendarIcon className="h-4 w-4" />
          <span className="text-sm truncate">{getSelectedRangeName()}: {formatDateRange(value.primary.from, value.primary.to)}</span>
          <ChevronDown className="w-4 h-4 ml-auto" />
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
        {renderMobileSheetContent()}
      </SheetContent>
    </Sheet>
  );

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
      <PopoverContent className="w-auto p-4" align="start">
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
      <div className="sm:hidden">
        {renderMobileView()}
      </div>
      
      <div className="hidden sm:block">
        {renderDesktopView()}
      </div>
    </>
  );
};

export default AdvancedDateRangePicker;
