
import React from 'react';
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
    <div className="mb-2">
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Filter size={14} />
          <span>Estado:</span>
        </div>
        
        <div className="flex flex-wrap gap-1.5">
          {statusOptions.map((option) => (
            <Badge 
              key={option.value}
              variant={option.checked ? option.color as any : "outline"}
              className={`
                cursor-pointer transition-all text-xs px-2 py-0.5
                ${option.checked 
                  ? 'shadow-sm' 
                  : 'opacity-70 hover:opacity-100 hover:bg-muted/50'
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
              className="h-6 px-2 text-xs"
              onClick={() => onToggleAll(!allSelected)}
            >
              {allSelected ? (
                <span className="flex items-center gap-1">
                  <X size={12} /> Limpiar
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <Check size={12} /> {noneSelected ? 'Todos' : 'Todos'}
                </span>
              )}
            </Button>
          )}
        </div>
      </div>
      
      {activeFilters > 0 && activeFilters < statusOptions.length && (
        <div className="text-xs text-muted-foreground ml-6 pl-1">
          {activeFilters} de {statusOptions.length} seleccionados
        </div>
      )}
    </div>
  );
}
