
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  // Map status to badge variants
  const getBadgeVariant = (status: string) => {
    switch(status.toLowerCase()) {
      case "completado": return "success";
      case "pendiente": return "warning";
      case "en progreso": return "info";
      case "cancelado": return "destructive";
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
              className={`px-3 py-1 cursor-pointer transition-all ${option.checked ? 'font-medium' : 'opacity-60'}`}
              onClick={() => onStatusFilterChange(option.value, !option.checked)}
            >
              {option.label}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
