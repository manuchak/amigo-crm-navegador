
import React, { useEffect, useState } from 'react';
import { X, Filter, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DriverBehaviorFilters } from '../types/driver-behavior.types';
import { DriverBehaviorImport } from './DriverBehaviorImport';
import { fetchClientList } from '../services/driverBehavior/dataService';
import { useQuery } from '@tanstack/react-query';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

interface DriverBehaviorFiltersPanelProps {
  filters: DriverBehaviorFilters;
  onFilterChange: (filters: DriverBehaviorFilters) => void;
  clientList?: string[]; // Optional, will fetch if not provided
}

export function DriverBehaviorFiltersPanel({
  filters,
  onFilterChange
}: DriverBehaviorFiltersPanelProps) {
  // Fetch client list
  const { data: clientsData, isLoading: isLoadingClients } = useQuery({
    queryKey: ['driver-behavior-clients'],
    queryFn: fetchClientList,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Local state for driver groups within selected client
  const [availableGroups, setAvailableGroups] = useState<string[]>([]);
  
  // Fetch driver groups when client changes
  const { data: groupsData, isLoading: isLoadingGroups } = useQuery({
    queryKey: ['driver-behavior-groups', filters.selectedClient],
    queryFn: async () => {
      if (!filters.selectedClient) return [];
      
      // Fetch driver groups for selected client
      const { data, error } = await fetch('/api/driver-groups?client=' + filters.selectedClient)
        .then(res => res.json());
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!filters.selectedClient,
    staleTime: 1000 * 60 * 5, // 5 minutes
    // Use mock data for now since we don't have the API endpoint yet
    placeholderData: filters.selectedClient ? ['Team A', 'Team B', 'Night Shift', 'Day Shift'] : []
  });
  
  useEffect(() => {
    if (groupsData) {
      setAvailableGroups(groupsData);
    }
  }, [groupsData]);
  
  // Handle client selection
  const handleClientChange = (clientName: string) => {
    // Reset groups when client changes
    const newFilters = {
      ...filters,
      selectedClient: clientName,
      selectedGroups: []
    };
    onFilterChange(newFilters);
  };
  
  // Handle group selection
  const handleGroupChange = (group: string, isChecked: boolean) => {
    let selectedGroups = [...(filters.selectedGroups || [])];
    
    if (isChecked) {
      selectedGroups.push(group);
    } else {
      selectedGroups = selectedGroups.filter(g => g !== group);
    }
    
    const newFilters = {
      ...filters,
      selectedGroups
    };
    onFilterChange(newFilters);
  };

  const handleClearFilters = () => {
    onFilterChange({});
  };
  
  const removeGroup = (group: string) => {
    const selectedGroups = (filters.selectedGroups || []).filter(g => g !== group);
    onFilterChange({...filters, selectedGroups});
  };

  // Check if there are active filters
  const hasFilters = Object.keys(filters).length > 0 && 
    (filters.selectedClient || filters.selectedGroups?.length || 
     (filters.selectedClients?.length || Object.keys(filters).some(key => key !== 'selectedClients' && !!filters[key as keyof DriverBehaviorFilters])));

  return (
    <div className="flex flex-wrap gap-3 items-center">
      <div className="flex flex-wrap gap-2 items-center">
        {/* Client filter */}
        <Select
          value={filters.selectedClient || ""}
          onValueChange={handleClientChange}
        >
          <SelectTrigger className="w-[180px] h-9">
            <SelectValue placeholder="Filtrar por cliente" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos los clientes</SelectItem>
            {clientsData?.map((client: string) => (
              <SelectItem key={client} value={client}>{client}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {/* Driver groups filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-9"
              disabled={!filters.selectedClient}
            >
              <Users className="h-4 w-4 mr-2" />
              Grupos
              {filters.selectedGroups && filters.selectedGroups.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {filters.selectedGroups.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-3" align="start">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Grupos de conductores</h4>
              <Separator />
              {isLoadingGroups ? (
                <div className="text-sm text-muted-foreground">Cargando...</div>
              ) : (
                <>
                  {availableGroups.length === 0 ? (
                    <div className="text-sm text-muted-foreground">No hay grupos disponibles</div>
                  ) : (
                    <div className="space-y-2">
                      {availableGroups.map(group => (
                        <div className="flex items-center space-x-2" key={group}>
                          <Checkbox 
                            id={`group-${group}`}
                            checked={(filters.selectedGroups || []).includes(group)}
                            onCheckedChange={(checked) => handleGroupChange(group, checked === true)}
                          />
                          <Label htmlFor={`group-${group}`}>{group}</Label>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </PopoverContent>
        </Popover>
        
        {/* Filter badges */}
        {filters.selectedGroups && filters.selectedGroups.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {filters.selectedGroups.map(group => (
              <Badge key={group} variant="outline" className="flex items-center gap-1">
                {group}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => removeGroup(group)} 
                />
              </Badge>
            ))}
          </div>
        )}
        
        {/* Clear filters button */}
        {hasFilters && (
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
      
      <div className="ml-auto">
        <DriverBehaviorImport onImportComplete={() => {}} />
      </div>
    </div>
  );
}
