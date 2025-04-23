
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

export default function ReferencesInput({ control, name = "installAddress.references" }: { control: any; name?: string }) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Referencias</FormLabel>
          <FormControl>
            <Textarea placeholder="Ej: Entre calles X y Y, portón azul..." {...field}/>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
