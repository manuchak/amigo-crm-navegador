
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export default function StateInput({ control, name = "installAddress.state" }: { control: any; name?: string }) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Estado / Entidad</FormLabel>
          <FormControl>
            <Input placeholder="Ej: Jalisco" {...field}/>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
