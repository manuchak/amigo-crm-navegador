
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { DialogFooter } from '@/components/ui/dialog';

interface RequirementFormProps {
  onSubmit: (data: any) => void;
  ciudadesMexico: string[];
  mesesDelAnio: string[];
  defaultMonth: string;
}

const CustodioRequirementForm: React.FC<RequirementFormProps> = ({ 
  onSubmit, 
  ciudadesMexico, 
  mesesDelAnio, 
  defaultMonth 
}) => {
  const form = useForm({
    defaultValues: {
      ciudad: '',
      mes: defaultMonth,
      cantidad: 1,
      armado: false,
      zona: ''
    }
  });

  const handleSubmit = (data: any) => {
    onSubmit(data);
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="ciudad"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ciudad</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar ciudad" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {ciudadesMexico.map((ciudad) => (
                    <SelectItem key={ciudad} value={ciudad}>
                      {ciudad}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="mes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mes</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar mes" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {mesesDelAnio.map((mes) => (
                    <SelectItem key={mes} value={mes}>
                      {mes}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="cantidad"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cantidad de Custodios</FormLabel>
              <FormControl>
                <Input type="number" {...field} min="1" />
              </FormControl>
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="armado"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Custodio Armado</FormLabel>
              </div>
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="zona"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Zona (opcional)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Ej: Norte, Centro, etc." />
              </FormControl>
            </FormItem>
          )}
        />
        
        <DialogFooter>
          <Button type="submit">Guardar Requisito</Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default CustodioRequirementForm;
