
import React from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface StatusOption {
  label: string;
  value: string;
  checked: boolean;
}

interface ServiceStatusFilterProps {
  statusOptions: StatusOption[];
  onChange: (value: string, checked: boolean) => void;
}

export function ServiceStatusFilter({ statusOptions, onChange }: ServiceStatusFilterProps) {
  return (
    <Card className="border shadow-sm bg-white">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Estado de Servicio</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4">
          {statusOptions.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <Checkbox 
                id={`status-${option.value}`} 
                checked={option.checked}
                onCheckedChange={(checked) => onChange(option.value, !!checked)}
              />
              <label
                htmlFor={`status-${option.value}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {option.label}
              </label>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
