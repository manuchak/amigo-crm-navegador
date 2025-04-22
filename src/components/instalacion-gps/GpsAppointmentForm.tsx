
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { MapPin, Calendar as CalendarIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

type GpsAppointmentFormProps = {
  onBack: () => void;
  onSchedule: (data: GpsAppointmentFormData) => void;
};
type GpsAppointmentFormData = {
  date: Date | null;
  time: string;
  timezone: string;
  address: string;
  notes?: string;
};

const TIME_OPTIONS = [
  "08:00", "09:00", "10:00", "11:00",
  "12:00", "13:00", "14:00", "15:00",
  "16:00", "17:00", "18:00",
];

export default function GpsAppointmentForm({ onBack, onSchedule }: GpsAppointmentFormProps) {
  const [date, setDate] = React.useState<Date | null>(null);
  const [time, setTime] = React.useState("");
  const [timezone, setTimezone] = React.useState("GMT-6 México");
  const [address, setAddress] = React.useState("");
  const [notes, setNotes] = React.useState("");

  const disabled = !date || !time || !address;

  const timezoneOptions = [
    "GMT-6 México",
    "GMT-5 Cancún",
    "GMT-7 Chihuahua",
    "GMT-8 Tijuana"
  ];

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl my-4">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-br from-green-400 to-green-700 rounded-full p-2">
            <CalendarIcon className="text-white w-6 h-6" />
          </div>
          <CardTitle>Agendar cita de instalación</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-5"
          onSubmit={e => {
            e.preventDefault();
            if (!disabled) {
              onSchedule({ date, time, timezone, address, notes });
            }
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Fecha *</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button type="button" variant="outline" className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Selecciona una fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date ?? undefined}
                    onSelect={setDate}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Horario *</label>
              <div className="grid grid-cols-3 gap-2">
                {TIME_OPTIONS.map(opt => (
                  <Button
                    type="button"
                    key={opt}
                    variant={time === opt ? "default" : "outline"}
                    className="rounded-lg"
                    onClick={() => setTime(opt)}
                  >
                    <Clock className="w-4 h-4 mr-1" />
                    {opt}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Zona Horaria *</label>
              <select
                className="w-full border rounded px-3 py-2 bg-white"
                value={timezone}
                onChange={e => setTimezone(e.target.value)}
              >
                {timezoneOptions.map(zone => (
                  <option key={zone} value={zone}>{zone}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Dirección de instalación *</label>
              <Input
                placeholder="Dirección completa"
                value={address}
                onChange={e => setAddress(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Notas para el técnico</label>
            <Textarea
              placeholder="Observaciones adicionales, referencias, etc."
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>
          <div className="flex justify-between gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onBack}>
              Regresar
            </Button>
            <Button type="submit" disabled={disabled} className="px-10">
              Agendar instalación
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
