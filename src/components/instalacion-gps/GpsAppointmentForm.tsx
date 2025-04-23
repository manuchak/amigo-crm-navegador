
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { InstallationSummary } from "./appointment/InstallationSummary";
import { DateTimeSelector } from "./appointment/DateTimeSelector";

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

export default function GpsAppointmentForm({ onBack, onSchedule, installData }: GpsAppointmentFormProps) {
  const [date, setDate] = React.useState<Date | null>(null);
  const [time, setTime] = React.useState("");
  const [timezone, setTimezone] = React.useState("GMT-6 México");
  const [notes, setNotes] = React.useState("");
  const [isSaving, setIsSaving] = React.useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date || !time) return;
    
    setIsSaving(true);
    
    try {
      const formattedDate = format(date, "yyyy-MM-dd");
      
      const installationData = {
        date: formattedDate,
        time,
        timezone,
        vehicles: installData.vehicles,
        owner_name: installData.ownerName,
        email: installData.email,
        install_address: installData.installAddress,
        installer_id: installData.installer_id,
        notes: notes || null
      };
      
      const { data, error } = await supabase
        .from('gps_installations')
        .insert(installationData)
        .select();
      
      if (error) {
        throw error;
      }
      
      onSchedule({ date, time, timezone, notes });
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
          <form className="space-y-6" onSubmit={handleSubmit}>
            <DateTimeSelector
              date={date}
              time={time}
              timezone={timezone}
              onDateSelect={(selectedDate) => setDate(selectedDate || null)}
              onTimeSelect={setTime}
              onTimezoneSelect={setTimezone}
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
                disabled={!date || !time || isSaving}
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
