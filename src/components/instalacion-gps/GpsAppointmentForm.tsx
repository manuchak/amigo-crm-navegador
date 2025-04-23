
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { InstallationSummary } from "./appointment/InstallationSummary";
import { DateTimeSelector } from "./appointment/DateTimeSelector";
import { AppointmentError } from "./appointment/AppointmentError";
import { useGpsAppointment } from "./hooks/useGpsAppointment";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { checkForOwnerRole } from "@/integrations/supabase/client";

type GpsAppointmentFormProps = {
  onBack: () => void;
  onSchedule: (data: any) => void;
  installData: any;
};

export default function GpsAppointmentForm({ onBack, onSchedule, installData }: GpsAppointmentFormProps) {
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();
  
  // Verificación mejorada de rol de propietario
  const isOwnerFromRole = userData?.role === 'owner';
  const isOwnerFromStorage = checkForOwnerRole();
  const isOwner = isOwnerFromRole || isOwnerFromStorage;
  
  // Agregar logs de depuración para el estado de la sesión
  useEffect(() => {
    console.log("GpsAppointmentForm montado");
    console.log("Usuario actual:", currentUser);
    console.log("Datos de usuario:", userData);
    console.log("Rol de propietario desde userData:", isOwnerFromRole);
    console.log("Rol de propietario desde localStorage:", isOwnerFromStorage);
    console.log("Es propietario (combinado):", isOwner);
    
    // Verificar localStorage directamente para depuración
    try {
      const localStorageUser = localStorage.getItem('current_user');
      console.log("Usuario en localStorage:", localStorageUser ? JSON.parse(localStorageUser) : null);
    } catch (e) {
      console.error("Error al acceder a localStorage:", e);
    }
  }, [currentUser, userData, isOwner, isOwnerFromRole, isOwnerFromStorage]);
  
  const {
    form,
    handleSubmit,
    isSaving,
    error
  } = useGpsAppointment(onSchedule, installData);

  // Si no se proporcionan datos de instalación, mostrar el componente de error
  if (!installData) {
    return <AppointmentError onBack={onBack} noInstallData />;
  }

  // Si el usuario no está autenticado y no es propietario, mostrar error de autenticación
  if (!currentUser && !isOwner) {
    console.log("Error de autenticación: No hay usuario actual y no es propietario");
    return (
      <AppointmentError 
        error="Debes iniciar sesión para agendar instalaciones" 
        onBack={() => navigate('/login')} 
        showLoginButton 
      />
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <InstallationSummary installData={installData} />

      <Card className="bg-white/95 shadow-xl border-0">
        <CardHeader>
          <CardTitle className="text-xl font-medium text-gray-800">
            Agendar cita de instalación {isOwner && (
              <span className="text-xs text-violet-600">
                (propietario{isOwnerFromRole ? "-role" : ""}{isOwnerFromStorage ? "-storage" : ""})
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <DateTimeSelector
                date={form.watch("date")}
                time={form.watch("time")}
                timezone={form.watch("timezone")}
                onDateSelect={(selectedDate) => {
                  console.log("Fecha seleccionada:", selectedDate);
                  form.setValue("date", selectedDate || null, { shouldValidate: true });
                }}
                onTimeSelect={(time) => form.setValue("time", time, { shouldValidate: true })}
                onTimezoneSelect={(timezone) => form.setValue("timezone", timezone, { shouldValidate: true })}
                errors={form.formState.errors}
              />

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Notas adicionales
                </label>
                <Textarea 
                  placeholder="Instrucciones especiales, referencias, etc."
                  className="resize-none border-gray-200"
                  {...form.register("notes")}
                />
              </div>

              {error && <AppointmentError error={error} onBack={onBack} />}

              <div className="flex justify-between gap-4 pt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onBack}
                  className="border-gray-200"
                >
                  Regresar
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSaving}
                  className="px-10 bg-violet-600 hover:bg-violet-700"
                >
                  {isSaving ? "Guardando..." : "Agendar instalación"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
