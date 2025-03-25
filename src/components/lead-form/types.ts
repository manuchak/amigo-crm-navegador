
import { z } from "zod";

export const formSchema = z.object({
  nombre: z.string().min(3, "El nombre es requerido"),
  email: z.string().email("Email inválido"),
  codigoPais: z.string().default("+52"),
  telefono: z.string().min(10, "Ingrese un número telefónico válido de 10 dígitos"),
  tieneCarroPropio: z.enum(["SI", "NO"]),
  anioCarro: z.number().optional(),
  experienciaSeguridad: z.enum(["SI", "NO"]),
  credencialSedena: z.enum(["SI", "NO"]),
});

export type LeadFormValues = z.infer<typeof formSchema>;

export type LeadFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: LeadFormValues) => void;
};
