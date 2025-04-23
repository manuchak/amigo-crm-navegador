
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, isWeekend, isBefore, startOfToday } from "date-fns";
import { MapPin, CalendarIcon, Clock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast"; // Import the toast hook

type GpsAppointmentFormProps = {
  onBack: () => void;
  onSchedule: (data: GpsAppointmentFormData) => void;
  installData: any; // Previous form data
};

type GpsAppointmentFormData = {
  date: Date | null;
  time: string;
  timezone: string;
  notes?: string;
};

const TIME_OPTIONS = [
  "08:00", "09:00", "10:00", "11:00",
  "12:00", "13:00", "14:00", "15:00",
  "16:00", "17:00", "18:00",
];

// Mexican holidays 2024-2025 (add more as needed)
const HOLIDAYS = [
  "2024-05-01", // Labor Day
  "2024-09-16", // Independence Day
  "2024-12-25", // Christmas
  "2025-01-01", // New Year's
];

const isHoliday = (date: Date) => {
  return HOLIDAYS.includes(format(date, "yyyy-MM-dd"));
};

export default function GpsAppointmentForm({ onBack, onSchedule, installData }: GpsAppointmentFormProps) {
  const [date, setDate] = React.useState<Date | null>(null);
  const [time, setTime] = React.useState("");
  const [timezone, setTimezone] = React.useState("GMT-6 México");
  const [notes, setNotes] = React.useState("");
  const { toast } = useToast(); // Use the toast hook

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) return;
    setDate(selectedDate);

    if (isWeekend(selectedDate)) {
      toast({
        variant: "warning",
        title: "Fin de semana seleccionado",
        description: "Ten en cuenta que este día es fin de semana. Confirma disponibilidad.",
      });
    }

    if (isHoliday(selectedDate)) {
      toast({
        variant: "warning",
        title: "Día festivo seleccionado",
        description: "Has seleccionado un día festivo. Por favor verifica disponibilidad.",
      });
    }
  };

  const timezoneOptions = [
    "GMT-6 México",
    "GMT-5 Cancún",
    "GMT-7 Chihuahua",
    "GMT-8 Tijuana"
  ];

  const disabled = !date || !time;

  // Format vehicle features for display
  const formatFeatures = (vehicle: any) => {
    if (!vehicle) return "";
    
    const features = [];
    if (vehicle.type === "fijo") {
      features.push(...(vehicle.gpsFeatures || []));
    } else if (vehicle.type === "dashcam") {
      features.push(`${vehicle.dashcamCameraCount || 2} cámaras`);
      features.push(...(vehicle.dashcamFeatures || []));
    }
    return features.join(", ");
  };

  // Adding null check for installData
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
      {/* Installation Summary Card */}
      <Card className="bg-white/95 shadow-xl border-0">
        <CardHeader>
          <CardTitle className="text-xl font-medium text-gray-800">Detalles de la Instalación</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-600 mb-2">Cliente</h3>
              <div className="space-y-2">
                <p className="text-gray-800">{installData.ownerName}</p>
                <p className="text-gray-600">{installData.installAddress?.phone}</p>
              </div>
            </div>
            <div>
              <h3 className="font-medium text-gray-600 mb-2">Ubicación</h3>
              <p className="text-gray-800">
                {installData.installAddress ? 
                  `${installData.installAddress.street} ${installData.installAddress.number}, 
                  ${installData.installAddress.colonia}, 
                  ${installData.installAddress.city}, 
                  ${installData.installAddress.state}` : 
                  "Dirección no disponible"}
              </p>
            </div>
          </div>
          <div className="border-t pt-4 mt-4">
            <h3 className="font-medium text-gray-600 mb-3">Vehículos y Equipamiento</h3>
            <div className="space-y-3">
              {installData.vehicles && installData.vehicles.map((vehicle: any, idx: number) => (
                <div key={idx} className="bg-gray-50 p-3 rounded-lg">
                  <p className="font-medium text-gray-800">
                    {vehicle.brand} {vehicle.model} {vehicle.year} - {vehicle.vehiclePlate}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Tipo: {vehicle.type === "fijo" ? "GPS Fijo" : "DashCam"}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Características: {formatFeatures(vehicle)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appointment Form Card */}
      <Card className="bg-white/95 shadow-xl border-0">
        <CardHeader>
          <CardTitle className="text-xl font-medium text-gray-800">Agendar cita de instalación</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-6"
            onSubmit={e => {
              e.preventDefault();
              if (!disabled) {
                onSchedule({ date, time, timezone, notes });
              }
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Fecha *</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal border-gray-200",
                        !date && "text-gray-500"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : "Selecciona una fecha"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date ?? undefined}
                      onSelect={handleDateSelect}
                      disabled={(date) => isBefore(date, startOfToday())}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Horario *</label>
                <div className="grid grid-cols-3 gap-2">
                  {TIME_OPTIONS.map(opt => (
                    <Button
                      type="button"
                      key={opt}
                      variant={time === opt ? "default" : "outline"}
                      className={cn(
                        "rounded-lg border-gray-200",
                        time === opt && "bg-violet-600 hover:bg-violet-700 text-white"
                      )}
                      onClick={() => setTime(opt)}
                    >
                      <Clock className="w-4 h-4 mr-1" />
                      {opt}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Zona Horaria *</label>
                <select
                  className="w-full border rounded-lg px-3 py-2 bg-white border-gray-200 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  value={timezone}
                  onChange={e => setTimezone(e.target.value)}
                >
                  {timezoneOptions.map(zone => (
                    <option key={zone} value={zone}>{zone}</option>
                  ))}
                </select>
              </div>
            </div>

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
                disabled={disabled} 
                className="px-10 bg-violet-600 hover:bg-violet-700"
              >
                Agendar instalación
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
