
import React, { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Car } from 'lucide-react';
import { useCarData } from '@/hooks/useCarData';
import type { CarModel } from '@/hooks/useCarData';

interface VehicleSectionProps {
  showVehicleDetails: boolean;
}

const VehicleSection = ({ showVehicleDetails }: VehicleSectionProps) => {
  const { control, setValue, watch } = useFormContext();
  const [availableModels, setAvailableModels] = useState<CarModel[]>([]);
  const { brands, fetchModelsByBrand, loading } = useCarData();
  
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 15 }, (_, i) => String(currentYear - i));
  
  const selectedBrandId = watch('marcaVehiculo');

  // Fetch car models when brand selection changes
  useEffect(() => {
    if (selectedBrandId) {
      const loadModels = async () => {
        const models = await fetchModelsByBrand(Number(selectedBrandId));
        setAvailableModels(models);
      };
      loadModels();
    } else {
      setAvailableModels([]);
    }
  }, [selectedBrandId, fetchModelsByBrand]);
  
  // Clear model selection when brand changes
  useEffect(() => {
    setValue('modeloVehiculo', '');
  }, [selectedBrandId, setValue]);
  
  if (!showVehicleDetails) return null;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6 border-l-2 border-gray-200">
      <FormField
        control={control}
        name="marcaVehiculo"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Marca del vehículo</FormLabel>
            <Select 
              onValueChange={field.onChange} 
              value={field.value || ''}
              disabled={loading}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione una marca" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {brands.map((brand) => (
                  <SelectItem key={brand.id} value={String(brand.id)}>
                    {brand.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={control}
        name="modeloVehiculo"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Modelo del vehículo</FormLabel>
            <Select 
              onValueChange={field.onChange} 
              value={field.value || ''} 
              disabled={!selectedBrandId || availableModels.length === 0}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={!selectedBrandId ? "Seleccione marca primero" : "Seleccione un modelo"} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {availableModels.map((model) => (
                  <SelectItem key={model.id} value={model.name}>
                    {model.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
