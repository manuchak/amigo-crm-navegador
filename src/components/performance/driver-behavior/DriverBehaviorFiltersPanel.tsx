
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
import { Checkbox } from "@/components/ui/checkbox";

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
  
  const handleClientToggle = (client: string) => {
    console.log("Client toggled:", client);
    // Initialize selectedClients if it doesn't exist
    const currentSelected = filters.selectedClients || [];
    
    // Toggle client selection
    let newSelectedClients: string[];
    
    if (currentSelected.includes(client)) {
      // Remove client if already selected
      newSelectedClients = currentSelected.filter(c => c !== client);
    } else {
      // Add client if not selected
      newSelectedClients = [...currentSelected, client];
    }
    
    console.log("New selected clients:", newSelectedClients);
    
    // Update filters with new selection
    onFilterChange({ 
      ...filters, 
      selectedClients: newSelectedClients.length > 0 ? newSelectedClients : undefined 
    });
  };
  
  const clearClientFilter = () => {
    onFilterChange({ ...filters, selectedClients: undefined });
  };
  
  const handleClearFilters = () => {
    onFilterChange({});
  };
  
  // Get a summary of selected clients for display
  const getSelectedClientsDisplay = () => {
    const selectedClients = filters.selectedClients || [];
    if (selectedClients.length === 0) return "Seleccionar Cliente(s)";
    if (selectedClients.length === 1) return selectedClients[0];
    return `${selectedClients.length} clientes seleccionados`;
  };

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
                  className="w-64 h-9 justify-between bg-white text-foreground border-gray-200 hover:bg-gray-50"
                >
                  {getSelectedClientsDisplay()}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-0 z-50 bg-white border border-gray-200 shadow-md">
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
                          className="cursor-pointer hover:bg-gray-100 flex items-center gap-2 py-2"
                          onSelect={() => {
                            handleClientToggle(client);
                          }}
                        >
                          <div 
                            className="flex items-center gap-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleClientToggle(client);
                            }}
                          >
                            <Checkbox
                              checked={(filters.selectedClients || []).includes(client)}
                              className="mr-2 h-4 w-4"
                            />
                            {client}
                          </div>
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

            {filters.selectedClients && filters.selectedClients.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearClientFilter}
                className="h-9 px-2"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            
            {(filters.driverName || filters.selectedClients) && (
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
