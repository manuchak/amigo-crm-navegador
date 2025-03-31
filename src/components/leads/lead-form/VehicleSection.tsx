
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Car } from 'lucide-react';

interface VehicleSectionProps {
  showVehicleDetails: boolean;
}

const VehicleSection = ({ showVehicleDetails }: VehicleSectionProps) => {
  const { control } = useFormContext();
  
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 15 }, (_, i) => String(currentYear - i));
  
  if (!showVehicleDetails) return null;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6 border-l-2 border-gray-200">
      <FormField
        control={control}
        name="modeloVehiculo"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Modelo del vehículo</FormLabel>
            <FormControl>
              <div className="relative">
                <Car className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input className="pl-9" placeholder="Ej. Nissan Versa" {...field} />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={control}
        name="anoVehiculo"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Año del vehículo</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar año" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {years.map(year => (
                  <SelectItem key={year} value={year}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default VehicleSection;
