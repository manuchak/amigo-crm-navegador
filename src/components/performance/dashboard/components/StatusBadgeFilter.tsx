
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Filter, X } from "lucide-react";
import { StatusOption } from '../hooks/useStatusFilters';

interface StatusBadgeFilterProps {
  statusOptions: StatusOption[];
  onStatusFilterChange: (value: string, checked: boolean) => void;
  onToggleAll: (checked: boolean) => void;
}

export function StatusBadgeFilter({ 
  statusOptions,
  onStatusFilterChange,
  onToggleAll
}: StatusBadgeFilterProps) {
  // Calculate if all or none are selected
  const allSelected = statusOptions.every(opt => opt.checked);
  const noneSelected = statusOptions.every(opt => !opt.checked);
  
  // Count active filters
  const activeFilters = statusOptions.filter(opt => opt.checked).length;
  
  return (
    <div className="mb-4">
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Filter size={15} />
          <span>Estado:</span>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {statusOptions.map((option) => (
            <Badge 
              key={option.value}
              variant={option.checked ? option.color as any : "outline"}
              className={`
                cursor-pointer transition-all px-3 py-1
                ${option.checked 
                  ? 'font-medium' 
                  : 'opacity-60 hover:opacity-100'
                }
              `}
              onClick={() => onStatusFilterChange(option.value, !option.checked)}
            >
              {option.checked && <Check className="mr-1 h-3 w-3" />}
              {option.label}
            </Badge>
          ))}
          
          {statusOptions.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 px-2 text-xs"
              onClick={() => onToggleAll(!allSelected)}
            >
              {allSelected ? (
                <span className="flex items-center gap-1">
                  <X size={14} /> Limpiar
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <Check size={14} /> {noneSelected ? 'Seleccionar todos' : 'Todos'}
                </span>
              )}
            </Button>
          )}
        </div>
      </div>
      
      {activeFilters > 0 && activeFilters < statusOptions.length && (
        <div className="text-xs text-muted-foreground ml-6 pl-1.5">
          {activeFilters} de {statusOptions.length} estados seleccionados
        </div>
      )}
    </div>
  );
}
