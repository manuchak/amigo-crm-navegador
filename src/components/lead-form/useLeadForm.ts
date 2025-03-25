
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { LeadFormValues, formSchema } from "./types";

export function useLeadForm({ onSubmit, onOpenChange }: { 
  onSubmit: (data: LeadFormValues) => void,
  onOpenChange: (open: boolean) => void 
}) {
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

  return {
    form,
    watchTieneCarro,
    handleSubmit
  };
}
