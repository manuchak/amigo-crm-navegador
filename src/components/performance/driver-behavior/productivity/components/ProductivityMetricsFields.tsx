
import React from 'react';
import { FormField, FormItem, FormLabel, FormMessage, FormControl } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { UseFormReturn } from 'react-hook-form';
import { ProductivityFormValues } from './ProductivityFormSchema';
import { ArrowDownToLine } from 'lucide-react';

interface ProductivityMetricsFieldsProps {
  form: UseFormReturn<ProductivityFormValues>;
  onFetchFuelPrice: () => Promise<void>;
}

export function ProductivityMetricsFields({ form, onFetchFuelPrice }: ProductivityMetricsFieldsProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-base font-medium text-gray-700">Parámetros de rendimiento</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Expected Daily Distance */}
        <FormField
          control={form.control}
          name="expected_daily_distance"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">Distancia Diaria Esperada (km)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  step="0.01"
                  min="0"
                  placeholder="150" 
                  className="bg-white focus:ring-gray-200"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Expected Daily Time Minutes */}
        <FormField
          control={form.control}
          name="expected_daily_time_minutes"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">Tiempo Diario Esperado (minutos)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  step="1"
                  min="0"
                  placeholder="480" 
                  className="bg-white focus:ring-gray-200"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Fuel Cost Per Liter */}
        <FormField
          control={form.control}
          name="fuel_cost_per_liter"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between mb-1.5">
                <FormLabel className="text-sm font-medium">Costo de Combustible ($/L)</FormLabel>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={onFetchFuelPrice}
                  className="h-7 text-xs bg-white hover:bg-gray-50"
                >
                  <ArrowDownToLine className="h-3 w-3 mr-1" />
                  Actualizar Precio
                </Button>
              </div>
              <FormControl>
                <Input 
                  type="number" 
                  step="0.01"
                  min="0"
                  placeholder="22.5" 
                  className="bg-white focus:ring-gray-200"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Expected Fuel Efficiency */}
        <FormField
          control={form.control}
          name="expected_fuel_efficiency"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">Rendimiento de Combustible (km/L)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  step="0.1"
                  min="0"
                  placeholder="10" 
                  className="bg-white focus:ring-gray-200"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
