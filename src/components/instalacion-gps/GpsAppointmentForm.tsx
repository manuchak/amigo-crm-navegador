
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { InstallationSummary } from "./appointment/InstallationSummary";
import { DateTimeSelector } from "./appointment/DateTimeSelector";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Textarea } from "@/components/ui/textarea";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";

type GpsAppointmentFormProps = {
  onBack: () => void;
  onSchedule: (data: GpsAppointmentFormData) => void;
  installData: any;
};

type GpsAppointmentFormData = {
  date: Date | null;
  time: string;
  timezone: string;
  notes?: string;
};

const appointmentSchema = z.object({
  date: z.date({
    required_error: "La fecha es requerida",
    invalid_type_error: "La fecha es inválida"
  }).min(new Date(), "La fecha debe ser en el futuro"),
  time: z.string().min(1, "Selecciona una hora"),
  timezone: z.string().min(1, "Selecciona una zona horaria"),
  notes: z.string().optional()
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

export default function GpsAppointmentForm({ onBack, onSchedule, installData }: GpsAppointmentFormProps) {
  const [isSaving, setIsSaving] = React.useState(false);
  const { toast } = useToast();

  const form = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      date: null,
      time: "",
      timezone: "GMT-6 México",
      notes: ""
    }
  });

  const handleSubmit = async (formData: AppointmentFormData) => {
    setIsSaving(true);
    
    try {
      const formattedDate = format(formData.date, "yyyy-MM-dd");
      
      const installationData = {
        date: formattedDate,
        time: formData.time,
        timezone: formData.timezone,
        vehicles: installData.vehicles,
        owner_name: installData.ownerName,
        email: installData.email,
        install_address: installData.installAddress,
        installer_id: installData.installer_id,
        notes: formData.notes || null
      };
      
      const { error } = await supabase
        .from('gps_installations')
        .insert(installationData)
        .select();
      
      if (error) {
        throw error;
      }

      // Aseguramos que todos los datos requeridos están presentes
      onSchedule({
        date: formData.date, // Garantizado por la validación
        time: formData.time,
        timezone: formData.timezone,
        notes: formData.notes
      });
      
      toast({
        title: "¡Éxito!",
        description: "La cita se ha programado correctamente.",
      });
    } catch (error) {
      console.error("Error al programar la instalación:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo programar la instalación. Por favor, inténtalo de nuevo.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Debugging para ver el estado de validación
  console.log("Form state:", {
    isValid: form.formState.isValid,
    isDirty: form.formState.isDirty,
    errors: form.formState.errors,
    values: form.getValues()
  });

  if (!installData) {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            No se encontraron datos de instalación. Por favor regrese e ingrese la información necesaria.
          </AlertDescription>
        </Alert>
        <div className="flex justify-center">
          <Button onClick={onBack}>Regresar</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <InstallationSummary installData={installData} />

      <Card className="bg-white/95 shadow-xl border-0">
        <CardHeader>
          <CardTitle className="text-xl font-medium text-gray-800">Agendar cita de instalación</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={form.handleSubmit(handleSubmit)}>
            <DateTimeSelector
              date={form.watch("date")}
              time={form.watch("time")}
              timezone={form.watch("timezone")}
              onDateSelect={(selectedDate) => form.setValue("date", selectedDate || null, { shouldValidate: true })}
              onTimeSelect={(time) => form.setValue("time", time, { shouldValidate: true })}
              onTimezoneSelect={(timezone) => form.setValue("timezone", timezone, { shouldValidate: true })}
              errors={form.formState.errors}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">Notas adicionales</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Instrucciones especiales, referencias, etc."
                      className="resize-none border-gray-200"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
        </CardContent>
      </Card>
    </div>
  );
}
