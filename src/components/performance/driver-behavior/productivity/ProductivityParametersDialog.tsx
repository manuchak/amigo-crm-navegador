
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { saveProductivityParameter, fetchCurrentFuelPrices } from '../../services/productivity/productivityService';
import { NewProductivityParameter } from '../../types/productivity.types';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { fetchDriverGroups } from '../../services/driverBehavior/driverGroupsService';

interface ProductivityParametersDialogProps {
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
  selectedClient?: string;
  availableGroups?: string[];
}

// Define the form schema
const formSchema = z.object({
  client: z.string().min(1, 'Cliente es requerido'),
  driver_group: z.string().optional(),
  expected_daily_distance: z.coerce.number().positive('Debe ser un número positivo'),
  expected_daily_time_minutes: z.coerce.number().int().positive('Debe ser un número entero positivo'),
  fuel_cost_per_liter: z.coerce.number().positive('Debe ser un número positivo'),
  expected_fuel_efficiency: z.coerce.number().positive('Debe ser un número positivo'),
});

export function ProductivityParametersDialog({ 
  open, 
  onClose, 
  onSaved,
  selectedClient,
  availableGroups = []
}: ProductivityParametersDialogProps) {
  // Fetch client list
  const { data: clientList = [] } = useQuery({
    queryKey: ['productivity-clients-for-form'],
    queryFn: async () => {
      const { data } = await supabase
        .from('driver_productivity_parameters')
        .select('client')
        .order('client');
        
      if (!data) return [];
      
      // Get unique clients
      const uniqueClients = Array.from(new Set(data.map(d => d.client)));
      
      // Add client from props if not in list
      if (selectedClient && !uniqueClients.includes(selectedClient)) {
        uniqueClients.push(selectedClient);
      }
      
      return uniqueClients;
    },
  });
  
  // Set up form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      client: selectedClient || '',
      driver_group: '',
      expected_daily_distance: 150,
      expected_daily_time_minutes: 480, // 8 hours
      fuel_cost_per_liter: 22.5,
      expected_fuel_efficiency: 10, // km per liter
    },
  });
  
  // Fetch groups for selected client
  const currentClient = form.watch('client');
  
  const { data: clientGroups = [] } = useQuery({
    queryKey: ['productivity-groups-for-client', currentClient],
    queryFn: async () => {
      if (!currentClient) return [];
      const groups = await fetchDriverGroups(currentClient);
      return groups.map(group => group.name);
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
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
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
  
  // Get active groups - use clientGroups from query if available, otherwise fall back to props
  const activeGroups = clientGroups.length > 0 ? clientGroups : availableGroups;
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] p-6">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-xl font-semibold text-center">
            Configurar Parámetros de Productividad
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-6">
              <div className="grid grid-cols-1 gap-4">
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
              </div>
              
              <div className="grid grid-cols-1 gap-4">
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
                          {activeGroups.length > 0 ? (
                            activeGroups.map((group) => (
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
              </div>
              
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
                        {Math.floor(Number(field.value) / 60)}h {Number(field.value) % 60}m
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
                          onClick={fetchLatestFuelPrice}
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
            </div>
            
            <DialogFooter className="flex justify-end gap-2 pt-2 mt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="bg-white"
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                className="px-6"
              >
                Guardar Parámetros
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
