
import React from 'react';
import { FormField, FormItem, FormLabel, FormMessage, FormControl, FormDescription } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';
import { ProductivityFormValues } from './ProductivityFormSchema';

interface DriverGroupSelectionProps {
  form: UseFormReturn<ProductivityFormValues>;
  groups: string[];
  isLoading: boolean;
  currentClient: string;
}

export function DriverGroupSelection({ form, groups, isLoading, currentClient }: DriverGroupSelectionProps) {
  return (
    <FormField
      control={form.control}
      name="driver_group"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-sm font-medium">
            Grupo de Conductores (opcional)
          </FormLabel>
          <Select 
            onValueChange={field.onChange} 
            value={field.value || ''}
            disabled={!currentClient}
          >
            <FormControl>
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="Seleccionar grupo" />
              </SelectTrigger>
            </FormControl>
            <SelectContent className="bg-white">
              <SelectItem value="no_group">Sin grupo específico</SelectItem>
              {groups.length > 0 ? (
                groups.map((group) => (
                  <SelectItem key={group} value={group}>{group}</SelectItem>
                ))
              ) : (
                <SelectItem value="empty" disabled>
                  {currentClient ? 'No hay grupos para este cliente' : 'Seleccione un cliente primero'}
                </SelectItem>
              )}
            </SelectContent>
          </Select>
          <FormDescription className="text-xs text-gray-500 mt-1">
            Si no se especifica un grupo, estos parámetros se aplicarán a todos los conductores del cliente.
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
