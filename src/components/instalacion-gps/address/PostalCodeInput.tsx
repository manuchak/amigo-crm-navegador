
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export default function PostalCodeInput({ control, name = "installAddress.postalCode" }: { control: any; name?: string }) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Código Postal</FormLabel>
          <FormControl>
            <Input placeholder="Ej: 44100" {...field}/>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
