
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { CaretSortIcon } from '@radix-ui/react-icons';
import { DriverBehaviorFilters } from '../types/driver-behavior.types';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchClientList } from '../services/productivity/productivityService';
import { fetchDriverGroups } from '../services/driverBehavior/driverGroupsService';

interface DriverBehaviorFiltersPanelProps {
  onFilterChange: (filters: DriverBehaviorFilters) => void;
  activeTab?: string;
  filters?: DriverBehaviorFilters;
}

export function DriverBehaviorFiltersPanel({ 
  onFilterChange, 
  activeTab = 'resumen',
  filters = {}
}: DriverBehaviorFiltersPanelProps) {
  const [selectedClient, setSelectedClient] = useState<string>(filters.selectedClient || 'all');
  const [selectedGroup, setSelectedGroup] = useState<string>(filters.selectedGroup || 'all');
  
  // Fetch available clients
  const { data: clients, isLoading: isLoadingClients } = useQuery({
    queryKey: ['driver-behavior-clients'],
    queryFn: fetchClientList,
  });
  
  // Fetch available driver groups based on selected client
  const { data: driverGroups, isLoading: isLoadingGroups } = useQuery({
    queryKey: ['driver-behavior-groups', selectedClient],
    queryFn: () => fetchDriverGroups(selectedClient !== 'all' ? selectedClient : undefined),
    enabled: !!selectedClient,
  });
  
  // Log query status for debugging
  console.log("Clients query:", { 
    isLoading: isLoadingClients, 
    clientsCount: clients?.length || 0, 
    clients 
  });
  
  console.log("Groups query:", { 
    isLoading: isLoadingGroups, 
    groupsCount: driverGroups?.length || 0,
    selectedClient,
    groups: driverGroups
  });
  
  // When client changes, reset group selection
  useEffect(() => {
    if (selectedClient !== filters.selectedClient) {
      setSelectedGroup('all');
    }
  }, [selectedClient, filters.selectedClient]);
  
  // Apply filters when selections change
  useEffect(() => {
    onFilterChange({
      selectedClient,
      selectedGroup
    });
    
  }, [selectedClient, selectedGroup, onFilterChange]);
  
  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="space-y-2">
        <Label htmlFor="client-filter" className="text-sm font-medium text-gray-500">Cliente</Label>
        {isLoadingClients ? (
          <Skeleton className="h-10 w-48" />
        ) : (
          <Select
            value={selectedClient}
            onValueChange={setSelectedClient}
          >
            <SelectTrigger id="client-filter" className="w-[200px] bg-white">
              <SelectValue placeholder="Seleccionar cliente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los clientes</SelectItem>
              {Array.isArray(clients) && clients.map(client => (
                <SelectItem key={client} value={client}>{client}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="group-filter" className="text-sm font-medium text-gray-500">Grupo</Label>
        {isLoadingGroups ? (
          <Skeleton className="h-10 w-48" />
        ) : (
          <Select
            value={selectedGroup}
            onValueChange={setSelectedGroup}
            disabled={!selectedClient || selectedClient === 'all'}
          >
            <SelectTrigger id="group-filter" className="w-[200px] bg-white">
              <SelectValue placeholder="Seleccionar grupo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los grupos</SelectItem>
              {Array.isArray(driverGroups) && driverGroups.map(group => {
                const groupName = typeof group === 'string' ? group : group.name;
                return <SelectItem key={groupName} value={groupName}>{groupName}</SelectItem>;
              })}
            </SelectContent>
          </Select>
        )}
      </div>
      
      {activeTab === 'productividad' && (
        <div className="flex items-end ml-auto">
          <div className="text-xs text-gray-500 flex items-center">
            <CaretSortIcon className="h-4 w-4 mr-1" />
            <span>Filtra para ver los análisis de productividad</span>
          </div>
        </div>
      )}
    </div>
  );
}
