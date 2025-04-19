
import React from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

interface YearMultiSelectProps {
  years: string[];
  selectedYears: string[];
  onChange: (values: string[]) => void;
}

export const YearMultiSelect: React.FC<YearMultiSelectProps> = ({
  years,
  selectedYears,
  onChange,
}) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full flex justify-between items-center font-normal"
        >
          {selectedYears.length === 0
            ? "Todos"
            : selectedYears.length === 1
            ? selectedYears[0]
            : `${selectedYears.length} seleccionados`}
          <ChevronDown className="ml-2 w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-2 w-48 z-50 bg-white">
        <div className="flex flex-col gap-1 max-h-52 overflow-y-auto">
          {years.map(year => (
            <label key={year} className="flex items-center gap-2 cursor-pointer text-sm rounded hover:bg-accent/30 px-1 py-1">
              <Checkbox
                checked={selectedYears.includes(year)}
                onCheckedChange={checked => {
                  if (checked) {
                    onChange([...selectedYears, year]);
                  } else {
                    onChange(selectedYears.filter(y => y !== year));
                  }
                }}
                id={`year-${year}`}
              />
              <span>{year}</span>
            </label>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};
