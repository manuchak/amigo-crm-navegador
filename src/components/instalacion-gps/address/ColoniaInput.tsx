
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export default function ColoniaInput({ control, name = "installAddress.colonia" }: { control: any; name?: string }) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Colonia</FormLabel>
          <FormControl>
            <Input placeholder="Colonia/Barrio/Fraccionamiento" {...field}/>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
