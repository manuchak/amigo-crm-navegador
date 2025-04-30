
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Badge } from "@/components/ui/badge";

export interface StatusOption {
  label: string;
  value: string;
  checked: boolean;
  color?: string;
}

interface StatusFilterSectionProps {
  statusOptions: StatusOption[];
  onStatusFilterChange: (value: string, checked: boolean) => void;
}

export function StatusFilterSection({ 
  statusOptions, 
  onStatusFilterChange 
}: StatusFilterSectionProps) {
  // Get the currently selected status values
  const selectedValues = statusOptions
    .filter(option => option.checked)
    .map(option => option.value);
  
  // Handle toggle click
  const handleToggleChange = (value: string) => {
    // Find if the item is currently checked
    const option = statusOptions.find(opt => opt.value === value);
    if (option) {
      // Toggle the checked value
      onStatusFilterChange(value, !option.checked);
    }
  };
  
  // Map status to badge variants
  const getBadgeVariant = (status: string) => {
    switch(status) {
      case "Completado": return "success";
      case "Pendiente": return "warning";
      case "En progreso": return "info";
      case "Cancelado": return "destructive";
      default: return "secondary";
    }
  };
  
  return (
    <Card className="border shadow-sm bg-white">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Estado de Servicio</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {statusOptions.map((option) => (
            <Badge 
              key={option.value}
              variant={option.checked ? getBadgeVariant(option.value) : "outline"}
              className={`px-3 py-1 cursor-pointer transition-all ${option.checked ? '' : 'opacity-70'}`}
              onClick={() => handleToggleChange(option.value)}
            >
              {option.label}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
