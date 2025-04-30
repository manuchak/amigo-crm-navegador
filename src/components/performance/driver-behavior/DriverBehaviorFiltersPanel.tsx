
import React, { useState } from 'react';
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DriverBehaviorFilters } from '../types/driver-behavior.types';
import { DriverBehaviorImport } from './DriverBehaviorImport';

interface DriverBehaviorFiltersPanelProps {
  filters: DriverBehaviorFilters;
  onFilterChange: (filters: DriverBehaviorFilters) => void;
  clientList?: string[]; // Make clientList optional
}

export function DriverBehaviorFiltersPanel({
  filters,
  onFilterChange
}: DriverBehaviorFiltersPanelProps) {
  const handleClearFilters = () => {
    onFilterChange({});
  };

  const hasFilters = Object.keys(filters).length > 0 && 
    (filters.selectedClients?.length || Object.keys(filters).some(key => key !== 'selectedClients' && !!filters[key as keyof DriverBehaviorFilters]));

  return (
    <div className="flex flex-wrap gap-3 items-center">
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
      
      <div className="ml-auto">
        <DriverBehaviorImport onImportComplete={() => {}} />
      </div>
    </div>
  );
}
