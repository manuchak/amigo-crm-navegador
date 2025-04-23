
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { isWeekend, isBefore, startOfToday, format } from "date-fns";
import { CalendarIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { FieldErrors } from "react-hook-form";
import { es } from "date-fns/locale";

type DateTimeSelectorProps = {
  date: Date | null;
  time: string;
  timezone: string;
  onDateSelect: (date: Date | undefined) => void;
  onTimeSelect: (time: string) => void;
  onTimezoneSelect: (timezone: string) => void;
  errors?: FieldErrors;
};

const TIME_OPTIONS = [
  "08:00", "09:00", "10:00", "11:00",
  "12:00", "13:00", "14:00", "15:00",
  "16:00", "17:00", "18:00",
];

const TIMEZONE_OPTIONS = [
  "GMT-6 México",
  "GMT-5 Cancún",
  "GMT-7 Chihuahua",
  "GMT-8 Tijuana"
];

const HOLIDAYS = [
  "2024-05-01", // Labor Day
  "2024-09-16", // Independence Day
  "2024-12-25", // Christmas
  "2025-01-01", // New Year's
];

const isHoliday = (date: Date) => {
  return HOLIDAYS.includes(format(date, "yyyy-MM-dd"));
};

export function DateTimeSelector({ 
  date, 
  time, 
  timezone, 
  onDateSelect, 
  onTimeSelect, 
  onTimezoneSelect,
  errors
}: DateTimeSelectorProps) {
  const { toast } = useToast();

  const handleDateSelect = (selectedDate: Date | undefined) => {
    onDateSelect(selectedDate);

    if (selectedDate) {
      if (isWeekend(selectedDate)) {
        toast({
          variant: "default",
          title: "Fin de semana seleccionado",
          description: "Ten en cuenta que este día es fin de semana. Confirma disponibilidad.",
        });
      }

      if (isHoliday(selectedDate)) {
        toast({
          variant: "default",
          title: "Día festivo seleccionado",
          description: "Has seleccionado un día festivo. Por favor verifica disponibilidad.",
        });
      }
    }
  };

  return (
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
                !date && "text-gray-500",
                errors?.date && "border-red-500"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP", { locale: es }) : "Selecciona una fecha"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date ?? undefined}
              onSelect={handleDateSelect}
              disabled={(date) => isBefore(date, startOfToday())}
              initialFocus
              locale={es}
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
        {errors?.date && (
          <p className="text-sm text-red-500 mt-1">{errors.date.message as string}</p>
        )}
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
                time === opt && "bg-violet-600 hover:bg-violet-700 text-white",
                errors?.time && !time && "border-red-500"
              )}
              onClick={() => onTimeSelect(opt)}
            >
              <Clock className="w-4 h-4 mr-1" />
              {opt}
            </Button>
          ))}
        </div>
        {errors?.time && (
          <p className="text-sm text-red-500 mt-1">{errors.time.message as string}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Zona Horaria *</label>
        <select
          className={cn(
            "w-full border rounded-lg px-3 py-2 bg-white border-gray-200 focus:ring-2 focus:ring-violet-500 focus:border-transparent",
            errors?.timezone && "border-red-500"
          )}
          value={timezone}
          onChange={e => onTimezoneSelect(e.target.value)}
        >
          <option value="">Seleccionar zona horaria</option>
          {TIMEZONE_OPTIONS.map(zone => (
            <option key={zone} value={zone}>{zone}</option>
          ))}
        </select>
        {errors?.timezone && (
          <p className="text-sm text-red-500 mt-1">{errors.timezone.message as string}</p>
        )}
      </div>
    </div>
  );
}
