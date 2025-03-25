
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Edit, Save } from 'lucide-react';

interface ForecastData {
  requerimientosPrevistos: number;
  requerimientosRealizados: number;
  efectividad?: number;
}

interface EditarForecastProps {
  forecast: ForecastData;
  onUpdate: (datos: ForecastData) => void;
}

const EditarForecastForm: React.FC<EditarForecastProps> = ({ forecast, onUpdate }) => {
  const [open, setOpen] = useState(false);
  
  const form = useForm({
    defaultValues: {
      requerimientosPrevistos: forecast.requerimientosPrevistos,
      requerimientosRealizados: forecast.requerimientosRealizados
    }
  });

  const handleSubmit = (data: any) => {
    onUpdate({
      requerimientosPrevistos: Number(data.requerimientosPrevistos),
      requerimientosRealizados: Number(data.requerimientosRealizados)
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Forecast Anual</DialogTitle>
          <DialogDescription>
            Actualiza los valores de previsión y resultados para el cálculo de efectividad
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="requerimientosPrevistos"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Requerimientos Previstos</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} min="1" />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="requerimientosRealizados"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Requerimientos Realizados</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} min="0" />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit">
                <Save className="h-4 w-4 mr-2" />
                Guardar Cambios
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditarForecastForm;
