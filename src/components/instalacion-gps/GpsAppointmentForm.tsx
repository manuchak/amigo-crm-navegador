
import React from "react";
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
  
  // Check for owner role using multiple methods
  const isOwner = userData?.role === 'owner' || checkForOwnerRole();
  
  const {
    form,
    handleSubmit,
    isSaving,
    error
  } = useGpsAppointment(onSchedule, installData);

  // If no install data is provided, show the error component
  if (!installData) {
    return <AppointmentError onBack={onBack} noInstallData />;
  }

  // If user is not logged in and not an owner, show auth error and provide a link to login
  if (!currentUser && !isOwner) {
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
            Agendar cita de instalación
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <DateTimeSelector
                date={form.watch("date")}
                time={form.watch("time")}
                timezone={form.watch("timezone")}
                onDateSelect={(selectedDate) => form.setValue("date", selectedDate || null, { shouldValidate: true })}
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
