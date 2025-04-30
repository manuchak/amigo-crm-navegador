
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { NewProductivityParameter, ProductivityParameter } from "../../types/productivity.types";
import { saveProductivityParameter } from "../../services/productivity/productivityService";

interface ProductivityParametersDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onParameterSaved: () => void;
  clients: string[];
  driverGroups: string[];
  editParameter?: ProductivityParameter;
}

export function ProductivityParametersDialog({
  isOpen,
  onClose,
  onParameterSaved,
  clients,
  driverGroups,
  editParameter
}: ProductivityParametersDialogProps) {
  const [isSaving, setIsSaving] = useState(false);
  
  const form = useForm<NewProductivityParameter>({
    defaultValues: {
      client: '',
      driver_group: '',
      expected_daily_distance: 100,
      expected_daily_time_minutes: 480, // 8 hours
      fuel_cost_per_liter: 24,
      expected_fuel_efficiency: 10 // 10 km per liter
    }
  });
  
  useEffect(() => {
    if (editParameter) {
      form.reset({
        id: editParameter.id,
        client: editParameter.client,
        driver_group: editParameter.driver_group || '',
        expected_daily_distance: editParameter.expected_daily_distance,
        expected_daily_time_minutes: editParameter.expected_daily_time_minutes,
        fuel_cost_per_liter: editParameter.fuel_cost_per_liter,
        expected_fuel_efficiency: editParameter.expected_fuel_efficiency
      });
    } else {
      form.reset({
        client: '',
        driver_group: '',
        expected_daily_distance: 100,
        expected_daily_time_minutes: 480,
        fuel_cost_per_liter: 24,
        expected_fuel_efficiency: 10
      });
    }
  }, [editParameter, form]);
  
  const handleSubmit = async (values: NewProductivityParameter) => {
    try {
      setIsSaving(true);
      
      // Format the driver_group: empty string becomes null
      const formattedValues = {
        ...values,
        driver_group: values.driver_group === '' ? null : values.driver_group
      };
      
      await saveProductivityParameter(formattedValues);
      toast.success(editParameter ? "Parámetros actualizados" : "Parámetros guardados");
      onParameterSaved();
      onClose();
    } catch (error) {
      console.error("Error saving productivity parameters:", error);
      toast.error("Error al guardar parámetros", {
        description: "Ha ocurrido un error al guardar los parámetros de productividad."
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>
            {editParameter ? "Editar Parámetros de Productividad" : "Nuevos Parámetros de Productividad"}
          </DialogTitle>
          <DialogDescription>
            Define los parámetros de productividad esperados para un cliente o grupo específico.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="client"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cliente</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      value={field.value}
                      disabled={isSaving || !!editParameter}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar cliente" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {clients.map(client => (
                          <SelectItem key={client} value={client}>
                            {client}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="driver_group"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Grupo (opcional)</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      value={field.value || ''}
                      disabled={isSaving || !!editParameter}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Todos los grupos" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="all">Todos los grupos</SelectItem>
                        {driverGroups.map(group => (
                          <SelectItem key={group} value={group}>
                            {group}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Si no se selecciona grupo, se aplicará a todos
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="expected_daily_distance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Distancia diaria esperada (km)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1"
                        step="1"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        disabled={isSaving}
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
                    <FormLabel>Tiempo diario esperado (minutos)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1"
                        step="1"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        disabled={isSaving}
                      />
                    </FormControl>
                    <FormDescription>
                      {Math.floor(field.value / 60)}h {field.value % 60}m
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="fuel_cost_per_liter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Costo de combustible por litro (MXN)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0.01"
                        step="0.01"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        disabled={isSaving}
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
                    <FormLabel>Rendimiento esperado (km/l)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0.1"
                        step="0.1"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        disabled={isSaving}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <DialogFooter>
              <Button variant="outline" type="button" onClick={onClose} disabled={isSaving}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Guardando..." : "Guardar parámetros"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
