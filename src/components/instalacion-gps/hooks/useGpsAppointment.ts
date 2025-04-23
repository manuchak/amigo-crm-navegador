
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { supabase, getAuthenticatedClient, checkForOwnerRole } from "@/integrations/supabase/client";
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

  // Check authentication status on mount with special handling for owner role
  useEffect(() => {
    const checkAuthStatus = async () => {
      // Clear any previous errors
      setError(null);
      
      // First check for owner role (fast path)
      const isOwner = userData?.role === 'owner' || checkForOwnerRole();
      if (isOwner) {
        console.log("Usuario con rol owner detectado - sin restricción de autenticación");
        return;
      }
      
      // For non-owners, verify session
      const { data } = await supabase.auth.getSession();
      if (!data.session && !isOwner) {
        setError("Debes iniciar sesión para agendar instalaciones.");
      }
    };
    
    checkAuthStatus();
  }, [userData]);

  const handleSubmit = async (formData: AppointmentFormData) => {
    console.log("Submit attempt with form data:", formData);
    setIsSaving(true);
    setError(null);
    
    try {
      // First check for owner role (fast path)
      const isOwner = userData?.role === 'owner' || checkForOwnerRole();
      
      // Get an authenticated client - if owner, this will return admin client
      const client = await getAuthenticatedClient();
      
      // Only verify session for non-owners
      if (!isOwner) {
        // Double-check session to ensure authentication
        const { data: { session } } = await client.auth.getSession();
        
        if (!session?.user?.id) {
          throw new Error("Debes iniciar sesión para agendar instalaciones");
        }
      }
      
      const formattedDate = format(formData.date, "yyyy-MM-dd");
      
      // Use the user ID from the session or a default for owners without session
      const userId = isOwner 
        ? (currentUser?.uid || userData?.uid || 'owner-user')
        : (await client.auth.getSession()).data.session?.user.id;
      
      if (!userId) {
        throw new Error("No se pudo identificar al usuario");
      }
      
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
        user_id: userId
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
      
      // Special handling for owner role - show more debug info
      const isOwner = userData?.role === 'owner' || checkForOwnerRole();
      
      // Provide a more user-friendly error message
      let errorMessage = "No se pudo programar la instalación";
      
      if (error.message.includes("logged in")) {
        errorMessage += ": Necesitas iniciar sesión para agendar una instalación";
      } else if (error.message.includes("permission denied")) {
        errorMessage += ": No tienes permisos para realizar esta acción";
      } else {
        errorMessage += `: ${error.message || 'Error desconocido'}`;
      }
      
      if (isOwner) {
        errorMessage += ` (Debug - Role: ${userData?.role}, Auth: ${!!currentUser})`;
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
