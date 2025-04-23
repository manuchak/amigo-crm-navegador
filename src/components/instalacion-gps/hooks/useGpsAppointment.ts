
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

const appointmentSchema = z.object({
  date: z.date({
    required_error: "La fecha es requerida",
    invalid_type_error: "La fecha es inválida"
  }).min(new Date(), "La fecha debe ser en el futuro"),
  time: z.string().min(1, "Selecciona una hora"),
  timezone: z.string().min(1, "Selecciona una zona horaria"),
  notes: z.string().optional()
});

export type AppointmentFormData = z.infer<typeof appointmentSchema>;

export const useGpsAppointment = (onSchedule: (data: AppointmentFormData) => void, installData: any) => {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Create the form with validation
  const form = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      date: null,
      time: "",
      timezone: "GMT-6 México",
      notes: ""
    }
  });

  // Clear any errors when component mounts
  useEffect(() => {
    setError(null);
  }, []);

  const handleSubmit = async (formData: AppointmentFormData) => {
    console.log("Submit attempt with form data:", formData);
    setIsSaving(true);
    setError(null);
    
    try {
      // Formatear la fecha para inserción
      const formattedDate = format(formData.date, "yyyy-MM-dd");
      
      // Preparar los datos de instalación
      const installationData = {
        date: formattedDate,
        time: formData.time,
        timezone: formData.timezone,
        vehicles: installData.vehicles || [],
        owner_name: installData.ownerName || "",
        email: installData.email || "",
        install_address: installData.installAddress || {},
        installer_id: installData.installer_id || null,
        notes: formData.notes || null,
        // No incluir user_id ya que ahora cualquiera puede insertar
      };
      
      console.log("Datos preparados para inserción:", {
        date: installationData.date,
        time: installationData.time,
        owner: installationData.owner_name,
        installer_id: installationData.installer_id
      });
      
      // Usar el cliente estándar de Supabase directamente
      const { data, error: insertError } = await supabase
        .from('gps_installations')
        .insert(installationData)
        .select();
      
      // Verificar errores en la respuesta
      if (insertError) {
        console.error("Error de Supabase:", insertError);
        throw insertError;
      }

      console.log("Instalación agendada exitosamente:", data);
      onSchedule(formData);
      
      toast({
        title: "¡Éxito!",
        description: "La cita se ha programado correctamente.",
      });
    } catch (error: any) {
      console.error("Error al agendar instalación:", error);
      
      // Proporcionar mensaje de error amigable
      let errorMessage = "No se pudo programar la instalación";
      
      if (error.message?.includes("permission denied")) {
        errorMessage += ": Error de permisos. Contacta al administrador.";
      } else if (error.message?.includes("Invalid API key")) {
        errorMessage += ": Error de configuración con la API de Supabase.";
      } else {
        errorMessage += `: ${error.message || 'Error desconocido'}`;
      }
      
      setError(errorMessage);
      
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo programar la instalación. Por favor, inténtalo de nuevo.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return {
    form,
    handleSubmit: form.handleSubmit(handleSubmit),
    isSaving,
    error,
  };
};
