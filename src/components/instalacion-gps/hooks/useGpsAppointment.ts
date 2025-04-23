
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { supabase, getAdminClient, checkForOwnerRole } from "@/integrations/supabase/client";
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

  // Clear any errors when component mounts
  useEffect(() => {
    setError(null);
  }, []);

  const handleSubmit = async (formData: AppointmentFormData) => {
    console.log("Submit attempt with form data:", formData);
    setIsSaving(true);
    setError(null);
    
    try {
      // First check for owner role
      const isOwner = userData?.role === 'owner' || checkForOwnerRole();
      console.log("Is owner role?", isOwner);
      
      // Format the date for insertion
      const formattedDate = format(formData.date, "yyyy-MM-dd");
      
      // Prepare the installation data
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
        user_id: null // Will be set appropriately below
      };

      let response;
      
      if (isOwner) {
        // For owners, create a completely fresh admin client for this operation
        console.log("Using admin client for owner role");
        const adminClient = getAdminClient();
        
        // Set owner user ID if available
        installationData.user_id = currentUser?.uid || userData?.uid || 'owner-user';
        
        // Use admin client for database operation
        response = await adminClient
          .from('gps_installations')
          .insert(installationData)
          .select();
      } else {
        // For regular users, verify session first
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user?.id) {
          throw new Error("Debes iniciar sesión para agendar instalaciones");
        }
        
        // Set the user ID for regular users
        installationData.user_id = session.user.id;
        
        // Use regular client for database operation
        response = await supabase
          .from('gps_installations')
          .insert(installationData)
          .select();
      }
      
      // Handle potential errors
      if (response.error) {
        console.error("Supabase error:", response.error);
        throw response.error;
      }

      console.log("Installation scheduled successfully:", response.data);
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
      } else if (error.message.includes("Invalid API key")) {
        errorMessage += ": Error de configuración con la API de Supabase";
      } else {
        errorMessage += `: ${error.message || 'Error desconocido'}`;
      }
      
      // Show role information for debugging
      const isOwner = userData?.role === 'owner' || checkForOwnerRole();
      errorMessage += ` (Role: ${userData?.role || 'unknown'}, Auth: ${!!currentUser})`;
      
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
