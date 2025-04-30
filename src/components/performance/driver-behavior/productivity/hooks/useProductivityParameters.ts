
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { fetchDriverGroups } from '../../../services/driverBehavior/driverGroupsService';
import { fetchCurrentFuelPrices, saveProductivityParameter } from '../../../services/productivity/productivityService';
import { NewProductivityParameter } from '../../../types/productivity.types';
import { productivityFormSchema, ProductivityFormValues, defaultFormValues } from '../components/ProductivityFormSchema';

interface UseProductivityParametersProps {
  selectedClient?: string;
  onSaved?: () => void;
  onClose: () => void;
}

export const useProductivityParameters = ({ selectedClient, onSaved, onClose }: UseProductivityParametersProps) => {
  // Set up form
  const form = useForm<ProductivityFormValues>({
    resolver: zodResolver(productivityFormSchema),
    defaultValues: {
      ...defaultFormValues,
      client: selectedClient || '',
    },
  });
  
  // Fetch groups for selected client
  const currentClient = form.watch('client');
  
  const { data: clientGroups = [], isLoading: isLoadingGroups } = useQuery({
    queryKey: ['productivity-groups-for-client', currentClient],
    queryFn: async () => {
      if (!currentClient) return [];
      const groups = await fetchDriverGroups(currentClient);
      return groups.map(group => typeof group === 'string' ? group : group.name);
    },
    enabled: !!currentClient,
  });
  
  // Update default client when selectedClient changes
  useEffect(() => {
    if (selectedClient) {
      form.setValue('client', selectedClient);
    }
  }, [selectedClient, form]);
  
  // Handle form submission
  const onSubmit = async (values: ProductivityFormValues) => {
    try {
      const parameter: NewProductivityParameter = {
        client: values.client,
        driver_group: values.driver_group || null,
        expected_daily_distance: values.expected_daily_distance,
        expected_daily_time_minutes: values.expected_daily_time_minutes,
        fuel_cost_per_liter: values.fuel_cost_per_liter,
        expected_fuel_efficiency: values.expected_fuel_efficiency,
      };
      
      await saveProductivityParameter(parameter);
      
      toast.success('Parámetros guardados correctamente');
      onSaved?.();
      onClose();
    } catch (error) {
      console.error('Error saving parameters:', error);
      toast.error('Error al guardar los parámetros');
    }
  };
  
  // Get latest fuel price
  const fetchLatestFuelPrice = async () => {
    try {
      const prices = await fetchCurrentFuelPrices();
      if (prices.regular) {
        form.setValue('fuel_cost_per_liter', prices.regular);
        toast.success('Precio de combustible actualizado');
      } else {
        toast.error('No se pudo obtener el precio actual del combustible');
      }
    } catch (error) {
      console.error('Error fetching fuel prices:', error);
      toast.error('Error al obtener el precio del combustible');
    }
  };
  
  return {
    form,
    clientGroups,
    isLoadingGroups,
    onSubmit,
    fetchLatestFuelPrice,
  };
};
