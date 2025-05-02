
import * as React from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DateRangePickerProps {
  value: DateRange;
  onChange: (value: DateRange) => void;
  className?: string;
}

const presets = [
  {
    label: "Último mes",
    getValue: () => {
      const today = new Date();
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      return { from: firstDayOfMonth, to: lastDayOfMonth };
    },
  },
  {
    label: "Este mes",
    getValue: () => {
      const today = new Date();
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      return { from: firstDayOfMonth, to: today };
    },
  },
  {
    label: "Últimos 3 meses",
    getValue: () => {
      const today = new Date();
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      return { from: threeMonthsAgo, to: today };
    },
  },
  {
    label: "Últimos 6 meses",
    getValue: () => {
      const today = new Date();
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      return { from: sixMonthsAgo, to: today };
    },
  },
  {
    label: "Este año",
    getValue: () => {
      const today = new Date();
      const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
      return { from: firstDayOfYear, to: today };
    },
  },
  {
    label: "Último año",
    getValue: () => {
      const today = new Date();
      const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
      return { from: oneYearAgo, to: today };
    },
  },
];

export default function DateRangePicker({
  value,
  onChange,
  className,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            size="sm"
            className={cn(
              "w-auto justify-start text-left font-normal hover:bg-muted/30",
              !value && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value?.from ? (
              value.to ? (
                <>
                  {format(value.from, "dd MMM yyyy", { locale: es })} -{" "}
                  {format(value.to, "dd MMM yyyy", { locale: es })}
                </>
              ) : (
                format(value.from, "dd MMM yyyy", { locale: es })
              )
            ) : (
              <span>Seleccionar fechas</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="grid gap-2 p-3 bg-muted/20">
            {presets.map((preset) => (
              <Button
                key={preset.label}
                size="sm"
                variant="ghost"
                className="justify-start font-normal"
                onClick={() => {
                  onChange(preset.getValue());
                  setIsOpen(false);
                }}
              >
                {preset.label}
              </Button>
            ))}
          </div>
          <div className="p-3 border-t">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={value?.from}
              selected={value}
              onSelect={(newValue) => {
                onChange(newValue || { from: null, to: null });
                if (newValue?.from && newValue?.to) {
                  setIsOpen(false);
                }
              }}
              numberOfMonths={2}
              locale={es}
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
