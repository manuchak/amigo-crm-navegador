
import React, { useState } from 'react';
import { Check, ChevronsUpDown, X } from "lucide-react";
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
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  
  const handleDriverNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, driverName: e.target.value });
  };
  
  const handleClientSelect = (client: string) => {
    onFilterChange({ ...filters, client });
    setOpen(false);
  };
  
  const clearClientFilter = () => {
    onFilterChange({ ...filters, client: undefined });
  };
  
  const handleClearFilters = () => {
    onFilterChange({});
  };

  // Log data to help debug the issue
  console.log("Client list in filters panel:", clientList);
  console.log("Current filters:", filters);
  
  return (
    <Card className="border-0 shadow-md bg-white">
      <CardContent className="p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="text-sm text-muted-foreground">Filtrar por:</div>
          
          <div className="flex items-center gap-2">
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
                  className="w-48 h-9 justify-between bg-white text-foreground border-gray-200 hover:bg-gray-50"
                >
                  {filters.client || "Seleccionar Cliente"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-0 z-50 bg-white border border-gray-200 shadow-md">
                <Command>
                  <CommandInput 
                    placeholder="Buscar cliente..." 
                    value={searchValue}
                    onValueChange={setSearchValue}
                  />
                  <CommandEmpty>No se encontraron clientes.</CommandEmpty>
                  <CommandGroup className="max-h-64 overflow-y-auto">
                    {Array.isArray(clientList) && clientList.length > 0 ? (
                      clientList.map((client) => (
                        <CommandItem
                          key={client}
                          value={client}
                          onSelect={() => handleClientSelect(client)}
                          className="cursor-pointer hover:bg-gray-100"
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
                      <CommandItem disabled className="opacity-50 cursor-default">
                        No hay clientes disponibles
                      </CommandItem>
                    )}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>

            {filters.client && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearClientFilter}
                className="h-9 px-2"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            
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
