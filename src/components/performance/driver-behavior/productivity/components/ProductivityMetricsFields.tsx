
import React from 'react';
import { FormField, FormItem, FormLabel, FormMessage, FormControl, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { UseFormReturn } from 'react-hook-form';
import { ProductivityFormValues } from './ProductivityFormSchema';

interface ProductivityMetricsFieldsProps {
  form: UseFormReturn<ProductivityFormValues>;
  onFetchFuelPrice: () => Promise<void>;
}

export function ProductivityMetricsFields({ form, onFetchFuelPrice }: ProductivityMetricsFieldsProps) {
  const dailyTimeValue = form.watch('expected_daily_time_minutes');
  
  // Calculate hours and minutes for display
  const hours = Math.floor(Number(dailyTimeValue) / 60);
  const minutes = Number(dailyTimeValue) % 60;
  
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="expected_daily_distance"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">Distancia Diaria Esperada (km)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min="0" 
                  step="0.01" 
                  className="bg-white"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="expected_daily_time_minutes"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">Tiempo Diario Esperado (min)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min="0" 
                  step="1" 
                  className="bg-white"
                  {...field} 
                />
              </FormControl>
              <FormDescription className="text-xs text-gray-500 mt-1">
                {hours}h {minutes}m
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="fuel_cost_per_liter"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex justify-between items-center text-sm font-medium">
                <span>Costo por Litro (MXN)</span>
                <Button 
                  type="button" 
                  variant="link" 
                  className="h-auto p-0 text-xs"
                  onClick={onFetchFuelPrice}
                >
                  Obtener precio actual
                </Button>
              </FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min="0" 
                  step="0.01" 
                  className="bg-white"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="expected_fuel_efficiency"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">Rendimiento de Combustible (km/l)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min="0" 
                  step="0.1" 
                  className="bg-white"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );
}
