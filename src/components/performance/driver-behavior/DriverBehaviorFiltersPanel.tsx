
import React, { useState } from 'react';
import { Check, ChevronsUpDown, X, Search } from "lucide-react";
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
import { DriverBehaviorImport } from './DriverBehaviorImport';
import { Badge } from '@/components/ui/badge';

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
    setSearchValue('');
  };
  
  // Get a summary of selected clients for display
  const getSelectedClientsDisplay = () => {
    const selectedClients = filters.selectedClients || [];
    if (selectedClients.length === 0) return "Todos los clientes";
    if (selectedClients.length === 1) return selectedClients[0];
    return `${selectedClients.length} clientes`;
  };

  const handleImportComplete = () => {
    // Refresh data after import
  };

  return (
    <div className="flex flex-wrap gap-3 items-center">
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar conductor"
          value={filters.driverName || ''}
          onChange={handleDriverNameChange}
          className="w-56 pl-9 h-9 rounded-full bg-background border-muted"
        />
        {filters.driverName && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onFilterChange({ ...filters, driverName: undefined })}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0 rounded-full"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="h-9 justify-between rounded-full border-muted"
          >
            <span className="truncate max-w-[150px]">{getSelectedClientsDisplay()}</span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[250px] p-0 z-50 bg-white border border-gray-200 shadow-md">
          <Command>
            <CommandInput 
              placeholder="Buscar cliente..." 
              value={searchValue}
              onValueChange={setSearchValue}
            />
            <CommandEmpty>No se encontraron clientes.</CommandEmpty>
            <CommandGroup className="max-h-[250px] overflow-y-auto">
              {Array.isArray(clientList) && clientList.length > 0 ? (
                clientList.map((client) => (
                  <CommandItem
                    key={client}
                    value={client}
                    className="flex items-center gap-2 py-2 cursor-pointer hover:bg-gray-100"
                    onSelect={() => handleClientToggle(client)}
                  >
                    <Checkbox
                      id={`client-${client}`}
                      checked={(filters.selectedClients || []).includes(client)}
                      onCheckedChange={() => handleClientToggle(client)}
                      className="mr-2 h-4 w-4"
                    />
                    <label 
                      htmlFor={`client-${client}`}
                      className="flex-1 cursor-pointer truncate"
                    >
                      {client}
                    </label>
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

      {(filters.selectedClients && filters.selectedClients.length > 0) &&
        <div className="flex flex-wrap gap-1 max-w-[400px]">
          {filters.selectedClients.map(client => (
            <Badge 
              key={client} 
              variant="outline" 
              className="h-7 px-2 gap-1"
            >
              {client}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1"
                onClick={() => handleClientToggle(client)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      }
      
      {(filters.driverName || (filters.selectedClients && filters.selectedClients.length > 0)) && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleClearFilters}
          className="h-9"
        >
          Limpiar filtros
        </Button>
      )}
      
      <div className="ml-auto">
        <DriverBehaviorImport onImportComplete={handleImportComplete} />
      </div>
    </div>
  );
}
