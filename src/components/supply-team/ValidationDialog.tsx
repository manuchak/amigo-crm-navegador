
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface ValidationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: any;
  operatorName: string;
  onConfirm: (data: any) => void;
}

const formSchema = z.object({
  nombre: z.string().min(2, "El nombre es requerido"),
  empresa: z.string().min(2, "La empresa es requerida"),
  telefono: z.string().min(10, "El teléfono debe tener al menos 10 dígitos"),
  email: z.string().email("El email no es válido"),
  estado: z.string(),
  notas: z.string().optional(),
});

const ValidationDialog: React.FC<ValidationDialogProps> = ({
  open,
  onOpenChange,
  data,
  operatorName,
  onConfirm,
}) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: data.nombre || "",
      empresa: data.empresa || "",
      telefono: data.telefono || "",
      email: data.email || "",
      estado: data.estado || "Nuevo",
      notas: "",
    },
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onConfirm({
      ...values,
      validadoPor: operatorName,
      fechaValidacion: new Date().toISOString().split('T')[0],
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Validar Información de Lead</DialogTitle>
          <DialogDescription>
            Verifica y actualiza la información del lead durante la llamada.
            Operador: <strong>{operatorName}</strong>
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="nombre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="empresa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Empresa/Tipo</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="telefono"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="estado"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar estado" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Nuevo">Nuevo</SelectItem>
                      <SelectItem value="Contactado">Contactado</SelectItem>
                      <SelectItem value="Validado">Validado</SelectItem>
                      <SelectItem value="No Interesado">No Interesado</SelectItem>
                      <SelectItem value="No Disponible">No Disponible</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notas"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas de la llamada</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Ingresa notas sobre la llamada de validación" 
                      className="resize-none" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit">Confirmar Validación</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ValidationDialog;
