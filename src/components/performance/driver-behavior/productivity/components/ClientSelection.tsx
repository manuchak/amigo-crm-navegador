
import React from 'react';
import { FormField, FormItem, FormLabel, FormMessage, FormControl } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';
import { ProductivityFormValues } from './ProductivityFormSchema';

interface ClientSelectionProps {
  form: UseFormReturn<ProductivityFormValues>;
  clientList: string[];
}

export function ClientSelection({ form, clientList }: ClientSelectionProps) {
  return (
    <FormField
      control={form.control}
      name="client"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-sm font-medium">Cliente</FormLabel>
          <Select 
            onValueChange={field.onChange} 
            value={field.value}
          >
            <FormControl>
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="Seleccionar cliente" />
              </SelectTrigger>
            </FormControl>
            <SelectContent className="bg-white max-h-[300px]">
              {clientList.length === 0 ? (
                <SelectItem value="no_clients" disabled>No hay clientes disponibles</SelectItem>
              ) : (
                clientList.map((client) => (
                  <SelectItem key={client} value={client}>{client}</SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
