
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export default function PhoneInputMx({ control, name = "installAddress.phone" }: { control: any; name?: string }) {
  // Prefijado a +52, el usuario solo puede poner el resto (10 dígitos)
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Teléfono de contacto</FormLabel>
          <FormControl>
            <div className="flex">
              <span className="flex items-center px-2 bg-slate-100 border border-r-0 border-slate-200 text-gray-600 rounded-l-md text-sm select-none">
                +52
              </span>
              <Input
                {...field}
                value={
                  // Siempre quitar cualquier prefijo que el usuario meta manualmente
                  field.value
                    ? field.value.replace(/^\+?52/, "")
                    : ""
                }
                onChange={e => {
                  // Siempre guarda sin prefijo, el backend puede agregar +52 si necesita
                  field.onChange(e.target.value.replace(/^\+?52/, ""));
                }}
                placeholder="Ej: 3312345678"
                maxLength={10}
                className="rounded-l-none"
                type="tel"
                pattern="[0-9]{10}"
                inputMode="numeric"
                autoComplete="tel"
              />
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
