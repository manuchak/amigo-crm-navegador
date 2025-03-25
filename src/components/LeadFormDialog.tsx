
import React from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, Car, Check, X } from "lucide-react";
import { format } from "date-fns";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 20 }, (_, i) => currentYear - i);

// Country codes data
const countryCodes = [
  { code: "+52", name: "México" },
  { code: "+1", name: "Estados Unidos" },
  { code: "+34", name: "España" },
  { code: "+57", name: "Colombia" },
  { code: "+54", name: "Argentina" },
  { code: "+56", name: "Chile" },
  { code: "+51", name: "Perú" },
  { code: "+55", name: "Brasil" },
];

const formSchema = z.object({
  nombre: z.string().min(3, "El nombre es requerido"),
  email: z.string().email("Email inválido"),
  codigoPais: z.string().default("+52"),
  telefono: z.string().min(10, "Ingrese un número telefónico válido de 10 dígitos"),
  tieneCarroPropio: z.enum(["SI", "NO"]),
  anioCarro: z.number().optional(),
  experienciaSeguridad: z.enum(["SI", "NO"]),
  credencialSedena: z.enum(["SI", "NO"]),
});

type LeadFormValues = z.infer<typeof formSchema>;

type LeadFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: LeadFormValues) => void;
};

export function LeadFormDialog({
  open,
  onOpenChange,
  onSubmit,
}: LeadFormDialogProps) {
  const form = useForm<LeadFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: "",
      email: "",
      codigoPais: "+52",
      telefono: "",
      tieneCarroPropio: "NO",
      experienciaSeguridad: "NO",
      credencialSedena: "NO",
    },
  });

  const { toast } = useToast();
  const watchTieneCarro = form.watch("tieneCarroPropio");

  const handleSubmit = (values: LeadFormValues) => {
    // Combine country code with phone number
    const completePhoneNumber = `${values.codigoPais}${values.telefono}`;
    
    // Create a new object with the modified phone number
    const submissionData = {
      ...values,
      telefono: completePhoneNumber,
    };
    
    onSubmit(submissionData);
    form.reset();
    toast({
      title: "Formulario enviado",
      description: "El lead ha sido registrado exitosamente",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Registro de Nuevo Lead
          </DialogTitle>
          <DialogDescription>
            Ingresa la información del prospecto de custodio
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4 py-4"
          >
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre Completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre completo" {...field} />
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
                    <Input
                      type="email"
                      placeholder="correo@ejemplo.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel>Número Telefónico</FormLabel>
              <div className="flex gap-2">
                <FormField
                  control={form.control}
                  name="codigoPais"
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="País" />
                      </SelectTrigger>
                      <SelectContent>
                        {countryCodes.map((country) => (
                          <SelectItem key={country.code} value={country.code}>
                            {country.name} {country.code}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />

                <FormField
                  control={form.control}
                  name="telefono"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input placeholder="10 dígitos" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </FormItem>

            <FormField
              control={form.control}
              name="tieneCarroPropio"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>¿Tiene carro propio?</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex space-x-4"
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="SI" />
                        </FormControl>
                        <FormLabel className="font-normal">Sí</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="NO" />
                        </FormControl>
                        <FormLabel className="font-normal">No</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {watchTieneCarro === "SI" && (
              <FormField
                control={form.control}
                name="anioCarro"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Año del Carro</FormLabel>
                    <FormControl>
                      <div className="grid grid-cols-4 gap-2 overflow-y-auto max-h-32 p-1 border rounded-md">
                        {yearOptions.map((year) => (
                          <Button
                            key={year}
                            type="button"
                            variant={field.value === year ? "default" : "outline"}
                            onClick={() => field.onChange(year)}
                            className="h-10"
                          >
                            {year}
                          </Button>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="experienciaSeguridad"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>¿Ha trabajado en el sector de seguridad?</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex space-x-4"
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="SI" />
                        </FormControl>
                        <FormLabel className="font-normal">Sí</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="NO" />
                        </FormControl>
                        <FormLabel className="font-normal">No</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="credencialSedena"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>¿Tiene credencial de la SEDENA?</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex space-x-4"
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="SI" />
                        </FormControl>
                        <FormLabel className="font-normal">Sí</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="NO" />
                        </FormControl>
                        <FormLabel className="font-normal">No</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit">Registrar Lead</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
