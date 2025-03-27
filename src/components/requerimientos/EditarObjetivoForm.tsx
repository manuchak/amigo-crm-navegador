
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Edit, Save } from 'lucide-react';
import { RequerimientoData } from './types';

interface EditarObjetivoProps {
  categoria: RequerimientoData;
  index: number;
  onUpdate: (index: number, datos: { objetivo: number; desglose?: { objetivo: number }[] }) => void;
}

const EditarObjetivoForm: React.FC<EditarObjetivoProps> = ({ categoria, index, onUpdate }) => {
  const [open, setOpen] = useState(false);
  
  const form = useForm({
    defaultValues: {
      objetivo: 0, // Default value since we removed objetivo
      desglose: categoria.desglose ? categoria.desglose.map(ciudad => ({
        ciudad: ciudad.ciudad,
        objetivo: 0 // Default value since we removed objetivo
      })) : undefined
    }
  });

  const handleSubmit = (data: any) => {
    onUpdate(index, data);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon">
          <Edit className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <h3 className="font-medium">Editar: {categoria.categoria}</h3>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="objetivo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Objetivo General</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} min="1" />
                    </FormControl>
                  </FormItem>
                )}
              />

              {categoria.desglose && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Objetivos por Ciudad</h4>
                  {categoria.desglose.map((ciudad, idx) => (
                    <FormField
                      key={idx}
                      control={form.control}
                      name={`desglose.${idx}.objetivo`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{ciudad.ciudad}</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} min="1" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              )}

              <div className="flex justify-end">
                <Button type="submit" size="sm">
                  <Save className="h-4 w-4 mr-2" />
                  Guardar
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default EditarObjetivoForm;
