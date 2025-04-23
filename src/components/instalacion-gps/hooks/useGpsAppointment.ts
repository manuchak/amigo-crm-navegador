
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
      // Verificar si el usuario tiene rol de propietario
      const isOwner = userData?.role === 'owner' || checkForOwnerRole();
      console.log("¿Es usuario propietario?", isOwner, { 
        userData, 
        userDataRole: userData?.role,
        isOwnerFromStorage: checkForOwnerRole(),
        currentUser: !!currentUser
      });
      
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
        user_id: null // Se configurará apropiadamente a continuación
      };

      let response;
      
      if (isOwner) {
        console.log("=== FLUJO DE PROPIETARIO DETECTADO ===");
        
        try {
          // Establecer ID de usuario para el propietario
          installationData.user_id = currentUser?.uid || userData?.uid || 'owner-special';
          
          console.log("Datos preparados para inserción:", {
            userId: installationData.user_id,
            role: userData?.role,
            date: installationData.date,
            time: installationData.time
          });
          
          // Crear un cliente admin fresco para la operación
          const adminClient = getAdminClient();
          console.log("Cliente admin obtenido correctamente");
          
          // Inserción directa con cliente admin
          response = await adminClient
            .from('gps_installations')
            .insert(installationData)
            .select();
            
          console.log("Respuesta de inserción admin:", response);
        } catch (adminError: any) {
          console.error("Error detallado con cliente admin:", adminError);
          throw new Error(`Error con cliente admin: ${adminError.message || 'Error desconocido'}`);
        }
      } else {
        // Para usuarios regulares
        console.log("Usando flujo de usuario regular para inserción");
        
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user?.id) {
          throw new Error("Debes iniciar sesión para agendar instalaciones");
        }
        
        // Establecer ID de usuario para usuarios regulares
        installationData.user_id = session.user.id;
        
        // Usar cliente estándar para la operación
        response = await supabase
          .from('gps_installations')
          .insert(installationData)
          .select();
      }
      
      // Verificar errores en la respuesta
      if (response?.error) {
        console.error("Error de Supabase:", response.error);
        throw response.error;
      }

      console.log("Instalación agendada exitosamente:", response?.data);
      onSchedule(formData);
      
      toast({
        title: "¡Éxito!",
        description: "La cita se ha programado correctamente.",
      });
    } catch (error: any) {
      console.error("Error al agendar instalación:", error);
      
      // Proporcionar mensaje de error amigable
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
      
      // Incluir información de rol para depuración
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
