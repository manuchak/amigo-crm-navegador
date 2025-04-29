
import React from 'react';
import { Check, ChevronsUpDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { DriverBehaviorFilters } from '../types/driver-behavior.types';

interface DriverBehaviorFiltersPanelProps {
  clientList: string[];
  filters: DriverBehaviorFilters;
  onFilterChange: (filters: DriverBehaviorFilters) => void;
}

export function DriverBehaviorFiltersPanel({
  clientList,
  filters,
  onFilterChange
}: DriverBehaviorFiltersPanelProps) {
  const [open, setOpen] = React.useState(false);
  
  const handleDriverNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, driverName: e.target.value });
  };
  
  const handleClientSelect = (client: string) => {
    onFilterChange({ ...filters, client });
    setOpen(false);
  };
  
  const handleClearFilters = () => {
    onFilterChange({});
  };
  
  return (
    <Card className="border-0 shadow-md bg-white/90">
      <CardContent className="p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Filtrar por:</span>
            
            <Input
              placeholder="Nombre de conductor"
              value={filters.driverName || ''}
              onChange={handleDriverNameChange}
              className="w-48 h-9"
            />
            
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-48 h-9 justify-between"
                >
                  {filters.client || "Seleccionar Cliente"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-0">
                <Command>
                  <CommandInput placeholder="Buscar cliente..." />
                  <CommandEmpty>No se encontraron clientes.</CommandEmpty>
                  <CommandGroup className="max-h-64 overflow-y-auto">
                    {clientList && clientList.length > 0 ? (
                      clientList.map((client) => (
                        <CommandItem
                          key={client}
                          value={client}
                          onSelect={() => handleClientSelect(client)}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              filters.client === client ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {client}
                        </CommandItem>
                      ))
                    ) : (
                      <CommandItem value="no-clients" disabled>
                        No hay clientes disponibles
                      </CommandItem>
                    )}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
            
            {(filters.driverName || filters.client) && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleClearFilters}
                className="h-9"
              >
                Limpiar filtros
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
