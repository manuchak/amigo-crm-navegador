
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { InstallationSummary } from "./appointment/InstallationSummary";
import { DateTimeSelector } from "./appointment/DateTimeSelector";
import { AppointmentError } from "./appointment/AppointmentError";
import { useGpsAppointment } from "./hooks/useGpsAppointment";
import { useNavigate } from "react-router-dom";

type GpsAppointmentFormProps = {
  onBack: () => void;
  onSchedule: (data: any) => void;
  installData: any;
};

export default function GpsAppointmentForm({ onBack, onSchedule, installData }: GpsAppointmentFormProps) {
  const navigate = useNavigate();
  
  // No hay datos de instalación
  if (!installData) {
    return <AppointmentError onBack={onBack} noInstallData />;
  }

  const {
    form,
    handleSubmit,
    isSaving,
    error
  } = useGpsAppointment(onSchedule, installData);

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
