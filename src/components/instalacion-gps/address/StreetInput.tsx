
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export default function StreetInput({ control, name = "installAddress.street" }: { control: any; name?: string }) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Calle</FormLabel>
          <FormControl>
            <Input placeholder="Ej: Av. Vallarta" {...field}/>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
