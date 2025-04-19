
import React from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

interface YearRangeSelectProps {
  minYear: number;
  maxYear: number;
  from?: number;
  to?: number;
  onChange: (from: number, to: number) => void;
}

export const YearRangeSelect: React.FC<YearRangeSelectProps> = ({
  minYear,
  maxYear,
  from,
  to,
  onChange
}) => {
  // Generate years options from maxYear down to minYear
  const years = [];
  for (let y = maxYear; y >= minYear; y--) {
    years.push(y);
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full flex justify-between items-center font-normal"
        >
          {from && to ? `De ${from} a ${to}` : "Todos"}
          <ChevronDown className="ml-2 w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-4 w-60 z-50 bg-white">
        <div className="flex gap-2 items-center mb-2">
          <span className="text-xs font-medium">De</span>
          <select
            className="rounded border px-2 py-1 text-xs w-full"
            value={from ?? ""}
            onChange={e => {
              const newFrom = parseInt(e.target.value) || minYear;
              let newTo = to ?? maxYear;
              if (newFrom > newTo) newTo = newFrom;
              onChange(newFrom, newTo);
            }}
          >
            <option value="">Desde</option>
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <span className="text-xs font-medium">a</span>
          <select
            className="rounded border px-2 py-1 text-xs w-full"
            value={to ?? ""}
            onChange={e => {
              const newTo = parseInt(e.target.value) || maxYear;
              let newFrom = from ?? minYear;
              if (newTo < newFrom) newFrom = newTo;
              onChange(newFrom, newTo);
            }}
          >
            <option value="">Hasta</option>
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <Button variant="ghost" size="sm" className="w-full mt-2"
          onClick={() => onChange(minYear, maxYear)}
        >
          Limpiar Filtro
        </Button>
      </PopoverContent>
    </Popover>
  );
};
