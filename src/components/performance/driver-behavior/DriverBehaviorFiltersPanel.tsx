
import React, { useState } from 'react';
import { X, Filter, Users, UserPlus } from "lucide-react";
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
import { DriverGroupsManagement } from './groups/DriverGroupsManagement';
import { fetchDriverGroups } from '../services/driverBehavior/driverGroupsService';
import { motion } from 'framer-motion';

interface DriverBehaviorFiltersPanelProps {
  filters: DriverBehaviorFilters;
  onFilterChange: (filters: DriverBehaviorFilters) => void;
  activeTab?: string;
  clientList?: string[]; // Optional, will fetch if not provided
}

export function DriverBehaviorFiltersPanel({
  filters,
  onFilterChange,
  activeTab
}: DriverBehaviorFiltersPanelProps) {
  // Fetch client list
  const { data: clientsData, isLoading: isLoadingClients } = useQuery({
    queryKey: ['driver-behavior-clients'],
    queryFn: fetchClientList,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // State for managing groups panel
  const [isGroupsManagementOpen, setIsGroupsManagementOpen] = useState(false);
  
  // Fetch driver groups based on selected client
  const { data: groupsData, isLoading: isLoadingGroups } = useQuery({
    queryKey: ['driver-behavior-groups', filters.selectedClient],
    queryFn: async () => {
      // Fetch all groups or only groups for the selected client
      return await fetchDriverGroups(filters.selectedClient);
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!filters.selectedClient,
  });
  
  // Handle client selection
  const handleClientChange = (clientName: string) => {
    // Reset groups when client changes
    const newFilters = {
      ...filters,
      selectedClient: clientName === "all" ? undefined : clientName,
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
  const hasFilters = !!(filters.selectedClient || (filters.selectedGroups && filters.selectedGroups.length > 0));

  // Open groups management with the current client preselected
  const handleOpenGroupsManagement = () => {
    setIsGroupsManagementOpen(true);
  };

  // Get available group names from the groups data
  const availableGroups = groupsData?.map(group => group.name) || [];

  // Animation variants
  const containerAnimation = {
    hidden: { opacity: 0, y: -10 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.3,
        staggerChildren: 0.05
      }
    }
  };

  const itemAnimation = {
    hidden: { opacity: 0, y: -5 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className="flex flex-wrap gap-3 items-center"
      initial="hidden"
      animate="show"
      variants={containerAnimation}
    >
      <motion.div 
        className="flex flex-wrap gap-2 items-center"
        variants={containerAnimation}
      >
        {/* Client filter */}
        <motion.div variants={itemAnimation}>
          <Select
            value={filters.selectedClient || "all"}
            onValueChange={handleClientChange}
          >
            <SelectTrigger className="w-[180px] h-9 bg-white border-gray-200 shadow-sm hover:border-gray-300 transition-all">
              <SelectValue placeholder="Filtrar por cliente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los clientes</SelectItem>
              {clientsData?.map((client: string) => (
                <SelectItem key={client} value={client}>{client}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>
        
        {/* Driver groups filter */}
        <motion.div variants={itemAnimation}>
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-9 bg-white border-gray-200 shadow-sm hover:border-gray-300 hover:bg-gray-50 transition-all"
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
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Grupos de conductores</h4>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0"
                    onClick={handleOpenGroupsManagement}
                  >
                    <UserPlus className="h-4 w-4" />
                    <span className="sr-only">Administrar grupos</span>
                  </Button>
                </div>
                <Separator />
                {isLoadingGroups ? (
                  <div className="text-sm text-muted-foreground">Cargando...</div>
                ) : (
                  <>
                    {availableGroups.length === 0 ? (
                      <div className="text-sm text-muted-foreground">
                        No hay grupos disponibles
                        <Button 
                          variant="link" 
                          size="sm" 
                          className="block px-0 h-auto mt-1"
                          onClick={handleOpenGroupsManagement}
                        >
                          <UserPlus className="h-3 w-3 mr-1" />
                          Crear grupo
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-[200px] overflow-auto pr-1">
                        {availableGroups.map(group => (
                          <div className="flex items-center space-x-2" key={group}>
                            <Checkbox 
                              id={`group-${group}`}
                              checked={(filters.selectedGroups || []).includes(group)}
                              onCheckedChange={(checked) => handleGroupChange(group, checked === true)}
                            />
                            <Label htmlFor={`group-${group}`} className="text-sm cursor-pointer">{group}</Label>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </motion.div>
        
        {/* Manage Groups Button - more subtle and hidden on small screens */}
        <motion.div variants={itemAnimation} className="hidden md:block">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-9"
            onClick={handleOpenGroupsManagement}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Gestionar Grupos
          </Button>
        </motion.div>
        
        {/* Filter badges with animation */}
        {filters.selectedGroups && filters.selectedGroups.length > 0 && (
          <motion.div 
            className="flex flex-wrap gap-1 items-center"
            variants={containerAnimation}
            initial="hidden"
            animate="show"
          >
            {filters.selectedGroups.map(group => (
              <motion.div key={group} variants={itemAnimation}>
                <Badge 
                  variant="outline" 
                  className="flex items-center gap-1 bg-white/80 backdrop-blur-sm"
                >
                  {group}
                  <X 
                    className="h-3 w-3 cursor-pointer ml-1 hover:text-red-500 transition-colors" 
                    onClick={() => removeGroup(group)} 
                  />
                </Badge>
              </motion.div>
            ))}
          </motion.div>
        )}
        
        {/* Clear filters button */}
        {hasFilters && (
          <motion.div variants={itemAnimation}>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleClearFilters}
              className="h-9 text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4 mr-1" />
              Limpiar filtros
            </Button>
          </motion.div>
        )}
      </motion.div>
      
      <div className="ml-auto">
        <DriverBehaviorImport onImportComplete={() => {}} />
      </div>
      
      {/* Groups Management Sheet */}
      <DriverGroupsManagement
        isOpen={isGroupsManagementOpen}
        onClose={() => setIsGroupsManagementOpen(false)}
        selectedClient={filters.selectedClient}
      />
    </motion.div>
  );
}
