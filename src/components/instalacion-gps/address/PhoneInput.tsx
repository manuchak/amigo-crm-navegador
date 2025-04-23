
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export default function PhoneInput({ control, name = "installAddress.phone" }: { control: any; name?: string }) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Teléfono de contacto</FormLabel>
          <FormControl>
            <Input placeholder="Ej: 3312345678" {...field}/>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
