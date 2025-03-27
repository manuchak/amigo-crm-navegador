
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DialogFooter } from '@/components/ui/dialog';
import { Car, Shield, Bus } from 'lucide-react';
import { TipoCustodio } from './types';

interface RequirementFormProps {
  onSubmit: (data: any) => void;
  ciudadesMexico: string[];
  mesesDelAnio: string[];
  defaultMonth: string;
}

const tiposCustodio: TipoCustodio[] = [
  'Custodio Estándar',
  'Custodio con Vehículo',
  'Custodio Armado',
  'Custodio Armado y con Vehículo',
  'Custodio A Bordo'
];

const getTipoCustodioIcon = (tipo: TipoCustodio) => {
  switch (tipo) {
    case 'Custodio con Vehículo':
      return <Car className="h-4 w-4 mr-2" />;
    case 'Custodio Armado':
      return <Shield className="h-4 w-4 mr-2" />;
    case 'Custodio Armado y con Vehículo':
      return <><Shield className="h-4 w-4 mr-1" /><Car className="h-4 w-4 mr-1" /></>;
    case 'Custodio A Bordo':
      return <Bus className="h-4 w-4 mr-2" />;
    default:
      return null;
  }
};

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
      tipoCustodio: 'Custodio Estándar' as TipoCustodio,
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
          name="tipoCustodio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Custodio</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo de custodio" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {tiposCustodio.map((tipo) => (
                    <SelectItem key={tipo} value={tipo}>
                      <div className="flex items-center">
                        {getTipoCustodioIcon(tipo)}
                        {tipo}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
