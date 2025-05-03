
import { useState, useEffect } from "react";
import { CalendarIcon } from "lucide-react";
import { addDays, format } from "date-fns";
import { es } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface DateRangePickerProps {
  value: DateRange;
  onChange: (value: DateRange) => void;
}

export default function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const [date, setDate] = useState<DateRange | undefined>(value);

  // Update component state when value prop changes
  useEffect(() => {
    setDate(value);
  }, [value]);

  // Function to handle date selection and propagate changes
  const handleSelect = (newDate: DateRange | undefined) => {
    setDate(newDate);
    if (newDate) {
      onChange(newDate);
    }
  };

  // Function to get the display text for the selected date range
  const getDateRangeText = () => {
    if (date?.from) {
      if (date.to) {
        return `${format(date.from, "dd/MM/yyyy", { locale: es })} - ${format(date.to, "dd/MM/yyyy", { locale: es })}`;
      }
      return format(date.from, "dd/MM/yyyy", { locale: es });
    }
    return "Seleccionar fechas";
  };

  // Generate preset date ranges
  const last7Days = {
    from: addDays(new Date(), -7),
    to: new Date(),
  };
  
  const last30Days = {
    from: addDays(new Date(), -30),
    to: new Date(),
  };
  
  const last90Days = {
    from: addDays(new Date(), -90),
    to: new Date(),
  };

  return (
    <div className="grid gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            size="sm"
            className="w-[240px] justify-start text-left font-normal border-slate-200"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {getDateRangeText()}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <div className="p-3 border-b">
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                className="text-xs"
                onClick={() => handleSelect(last7Days)}
              >
                7 días
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-xs"
                onClick={() => handleSelect(last30Days)}
              >
                30 días
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-xs"
                onClick={() => handleSelect(last90Days)}
              >
                90 días
              </Button>
            </div>
          </div>
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleSelect}
            numberOfMonths={2}
            locale={es}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
