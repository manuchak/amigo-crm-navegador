
import React from "react";
import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { LeadFormValues } from "./types";

type YearSelectionProps = {
  form: UseFormReturn<LeadFormValues>;
};

export function YearSelection({ form }: YearSelectionProps) {
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 20 }, (_, i) => currentYear - i);

  return (
    <FormField
      control={form.control}
      name="anioCarro"
      render={({ field }) => (
        <FormItem className="space-y-3">
          <FormLabel>Año del Carro</FormLabel>
          <FormControl>
            <div className="grid grid-cols-4 gap-2 overflow-y-auto max-h-32 p-1 border rounded-md">
              {yearOptions.map((year) => (
                <Button
                  key={year}
                  type="button"
                  variant={field.value === year ? "default" : "outline"}
                  onClick={() => field.onChange(year)}
                  className="h-10"
                >
                  {year}
                </Button>
              ))}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
