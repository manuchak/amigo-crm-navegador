
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
      esArmado: "NO",
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
    
    // Don't reset the form or close the dialog yet - we'll do this after confirmation
    toast({
      title: "Formulario completado",
      description: "Por favor confirma los datos del lead",
    });
  };

  return {
    form,
    watchTieneCarro,
    handleSubmit
  };
}
