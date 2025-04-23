
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { supabase, getAuthenticatedClient } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useAuth } from "@/context/AuthContext";

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
  const { userData, currentUser } = useAuth();

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

  // Check authentication status on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        setError("Debes iniciar sesión para agendar instalaciones.");
      }
    };
    
    checkAuthStatus();
  }, []);

  const handleSubmit = async (formData: AppointmentFormData) => {
    console.log("Submit attempt with form data:", formData);
    setIsSaving(true);
    setError(null);
    
    try {
      // Make sure we have an authenticated client with a fresh session
      const client = await getAuthenticatedClient();
      
      // Get current session to double-check we're authenticated
      const { data: { session } } = await client.auth.getSession();
      
      if (!session?.user?.id) {
        throw new Error("Debes iniciar sesión para agendar instalaciones");
      }
      
      const formattedDate = format(formData.date, "yyyy-MM-dd");
      
      // Use the user ID from the current session
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
        user_id: session.user.id
      };
      
      console.log("Sending installation data:", installationData);
      
      // Use the authenticated client for the database operation
      const { data, error: insertError } = await client
        .from('gps_installations')
        .insert(installationData)
        .select();
      
      if (insertError) {
        console.error("Supabase error:", insertError);
        throw insertError;
      }

      console.log("Installation scheduled successfully:", data);
      onSchedule(formData);
      
      toast({
        title: "¡Éxito!",
        description: "La cita se ha programado correctamente.",
      });
    } catch (error: any) {
      console.error("Error scheduling installation:", error);
      
      // Provide a more user-friendly error message
      let errorMessage = "No se pudo programar la instalación";
      
      if (error.message.includes("logged in")) {
        errorMessage += ": Necesitas iniciar sesión para agendar una instalación";
      } else if (error.message.includes("permission denied")) {
        errorMessage += ": No tienes permisos para realizar esta acción";
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
