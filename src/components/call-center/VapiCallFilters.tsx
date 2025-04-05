
import React, { useState } from 'react';
import { CheckIcon, FilterIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandSeparator } from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface VapiCallFiltersProps {
  onFilterChange: (filters: CallFilters) => void;
  activeFilters: CallFilters;
}

export interface CallFilters {
  status: string | null;
  direction: string | null;
  duration: number | null;
  dateRange: 'today' | 'week' | 'month' | 'all' | null;
}

const VapiCallFilters: React.FC<VapiCallFiltersProps> = ({ onFilterChange, activeFilters }) => {
  const [open, setOpen] = useState(false);
  
  // Status options
  const statusOptions = [
    { value: null, label: 'Todos' },
    { value: 'completed', label: 'Completadas' },
    { value: 'failed', label: 'Fallidas' },
    { value: 'ongoing', label: 'En curso' },
    { value: 'queued', label: 'En cola' }
  ];
  
  // Direction options
  const directionOptions = [
    { value: null, label: 'Todas' },
    { value: 'inbound', label: 'Entrantes' },
    { value: 'outbound', label: 'Salientes' }
  ];
  
  // Duration options
  const durationOptions = [
    { value: null, label: 'Cualquiera' },
    { value: 30, label: '< 30 segundos' },
    { value: 60, label: '> 1 minuto' },
    { value: 300, label: '> 5 minutos' }
  ];
  
  // Date range options
  const dateRangeOptions = [
    { value: null, label: 'Todo el tiempo' },
    { value: 'today', label: 'Hoy' },
    { value: 'week', label: 'Esta semana' },
    { value: 'month', label: 'Este mes' }
  ];
  
  const handleFilterChange = (filterType: keyof CallFilters, value: any) => {
    const newFilters = { ...activeFilters, [filterType]: value };
    onFilterChange(newFilters);
  };
  
  const getActiveFiltersCount = () => {
    return Object.values(activeFilters).filter(value => value !== null).length;
  };
  
  const resetFilters = () => {
    onFilterChange({
      status: null,
      direction: null,
      duration: null,
      dateRange: null
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <FilterIcon className="h-4 w-4" />
            <span>Filtros</span>
            {getActiveFiltersCount() > 0 && (
              <Badge className="ml-1 bg-primary text-xs">{getActiveFiltersCount()}</Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Buscar filtros..." />
            <CommandEmpty>No se encontraron filtros.</CommandEmpty>
            
            <CommandGroup heading="Estado">
              {statusOptions.map((option) => (
                <CommandItem
                  key={`status-${option.label}`}
                  onSelect={() => handleFilterChange('status', option.value)}
                  className="flex items-center justify-between"
                >
                  <span>{option.label}</span>
                  {activeFilters.status === option.value && (
                    <CheckIcon className="h-4 w-4" />
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
            
            <CommandSeparator />
            
            <CommandGroup heading="Dirección">
              {directionOptions.map((option) => (
                <CommandItem
                  key={`direction-${option.label}`}
                  onSelect={() => handleFilterChange('direction', option.value)}
                  className="flex items-center justify-between"
                >
                  <span>{option.label}</span>
                  {activeFilters.direction === option.value && (
                    <CheckIcon className="h-4 w-4" />
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
            
            <CommandSeparator />
            
            <CommandGroup heading="Duración">
              {durationOptions.map((option) => (
                <CommandItem
                  key={`duration-${option.label}`}
                  onSelect={() => handleFilterChange('duration', option.value)}
                  className="flex items-center justify-between"
                >
                  <span>{option.label}</span>
                  {activeFilters.duration === option.value && (
                    <CheckIcon className="h-4 w-4" />
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
            
            <CommandSeparator />
            
            <CommandGroup heading="Rango de fechas">
              {dateRangeOptions.map((option) => (
                <CommandItem
                  key={`date-${option.label}`}
                  onSelect={() => handleFilterChange('dateRange', option.value)}
                  className="flex items-center justify-between"
                >
                  <span>{option.label}</span>
                  {activeFilters.dateRange === option.value && (
                    <CheckIcon className="h-4 w-4" />
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
            
            <Separator className="my-2" />
            <div className="p-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={resetFilters}
              >
                Limpiar filtros
              </Button>
            </div>
          </Command>
        </PopoverContent>
      </Popover>
      
      {getActiveFiltersCount() > 0 && (
        <div className="flex flex-wrap gap-1">
          {activeFilters.status && (
            <Badge variant="outline" className="text-xs">
              Estado: {statusOptions.find(o => o.value === activeFilters.status)?.label}
            </Badge>
          )}
          {activeFilters.direction && (
            <Badge variant="outline" className="text-xs">
              Dirección: {directionOptions.find(o => o.value === activeFilters.direction)?.label}
            </Badge>
          )}
          {activeFilters.duration && (
            <Badge variant="outline" className="text-xs">
              Duración: {durationOptions.find(o => o.value === activeFilters.duration)?.label}
            </Badge>
          )}
          {activeFilters.dateRange && (
            <Badge variant="outline" className="text-xs">
              Fecha: {dateRangeOptions.find(o => o.value === activeFilters.dateRange)?.label}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default VapiCallFilters;
