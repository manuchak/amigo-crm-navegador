
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
      // Check for owner role
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
        // Debug logs para detectar problemas en la creación del cliente
        console.log("Usando cliente de administrador para rol de propietario");
        
        try {
          // Crear un cliente admin completamente nuevo para esta operación
          const adminClient = getAdminClient();
          
          // Verificar client headers para debugging
          console.log("Admin client headers:", adminClient.headers);
          
          // Configura el ID de usuario del propietario
          installationData.user_id = currentUser?.uid || userData?.uid || 'owner-user';
          
          console.log("Realizando inserción con cliente admin:", {
            url: adminClient?.supabaseUrl,
            hasAuth: !!adminClient?.headers?.Authorization,
            userId: installationData.user_id
          });
          
          // Usar cliente admin para operación de base de datos
          response = await adminClient
            .from('gps_installations')
            .insert(installationData)
            .select();
            
          console.log("Admin client response:", response);
        } catch (adminError) {
          console.error("Error using admin client:", adminError);
          throw new Error(`Error con cliente admin: ${adminError.message || 'Error desconocido'}`);
        }
      } else {
        // Para usuarios regulares, verificar sesión primero
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user?.id) {
          throw new Error("Debes iniciar sesión para agendar instalaciones");
        }
        
        // Establecer el ID de usuario para usuarios regulares
        installationData.user_id = session.user.id;
        console.log("Usuario regular:", installationData.user_id);
        
        // Usar cliente regular para operación de base de datos
        response = await supabase
          .from('gps_installations')
          .insert(installationData)
          .select();
      }
      
      // Verificar errores potenciales
      if (response?.error) {
        console.error("Supabase error:", response.error);
        throw response.error;
      }

      console.log("Installation scheduled successfully:", response?.data);
      onSchedule(formData);
      
      toast({
        title: "¡Éxito!",
        description: "La cita se ha programado correctamente.",
      });
    } catch (error: any) {
      console.error("Error scheduling installation:", error);
      
      // Proporcionar un mensaje de error más amigable para el usuario
      let errorMessage = "No se pudo programar la instalación";
      
      if (error.message?.includes("logged in") || error.message?.includes("iniciar")) {
        errorMessage += ": Necesitas iniciar sesión para agendar una instalación";
      } else if (error.message?.includes("permission denied")) {
        errorMessage += ": No tienes permisos para realizar esta acción";
      } else if (error.message?.includes("Invalid API key")) {
        errorMessage += ": Error de configuración con la API de Supabase";
      } else if (error.message?.includes("admin")) {
        errorMessage += `: Error con el cliente de administrador: ${error.message || 'Error desconocido'}`;
      } else {
        errorMessage += `: ${error.message || 'Error desconocido'}`;
      }
      
      // Mostrar información de rol para depuración
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
