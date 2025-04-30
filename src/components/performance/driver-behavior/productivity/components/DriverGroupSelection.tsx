
import React from 'react';
import { FormField, FormItem, FormLabel, FormMessage, FormControl } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { UseFormReturn } from 'react-hook-form';
import { ProductivityFormValues } from './ProductivityFormSchema';

interface DriverGroupSelectionProps {
  form: UseFormReturn<ProductivityFormValues>;
  groups: string[];
  isLoading: boolean;
  currentClient?: string;
}

export function DriverGroupSelection({ 
  form, 
  groups, 
  isLoading, 
  currentClient 
}: DriverGroupSelectionProps) {
  return (
    <FormField
      control={form.control}
      name="driver_group"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-sm font-medium">
            Grupo de Conductores {!currentClient && <span className="text-xs text-muted-foreground">(Selecciona un cliente primero)</span>}
          </FormLabel>
          {isLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <Select
              onValueChange={field.onChange}
              value={field.value ?? ''}
              disabled={!currentClient || groups.length === 0}
            >
              <FormControl>
                <SelectTrigger className="w-full bg-white focus:ring-gray-200">
                  <SelectValue placeholder="Seleccionar grupo" />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="bg-white max-h-[300px]">
                <SelectItem value="">Todos los grupos</SelectItem>
                {groups.map((group) => (
                  <SelectItem key={group} value={group}>{group}</SelectItem>
                ))}
                {groups.length === 0 && (
                  <SelectItem value="no_groups" disabled>No hay grupos disponibles</SelectItem>
                )}
              </SelectContent>
            </Select>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
