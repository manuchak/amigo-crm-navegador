
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LeadFormValues } from "./types";

type ContactInfoProps = {
  form: UseFormReturn<LeadFormValues>;
};

// Country codes data
const countryCodes = [
  { code: "+52", name: "México" },
  { code: "+1", name: "Estados Unidos" },
  { code: "+34", name: "España" },
  { code: "+57", name: "Colombia" },
  { code: "+54", name: "Argentina" },
  { code: "+56", name: "Chile" },
  { code: "+51", name: "Perú" },
  { code: "+55", name: "Brasil" },
];

export function ContactInfo({ form }: ContactInfoProps) {
  return (
    <>
      <FormField
        control={form.control}
        name="nombre"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nombre Completo</FormLabel>
            <FormControl>
              <Input placeholder="Nombre completo" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input
                type="email"
                placeholder="correo@ejemplo.com"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormItem>
        <FormLabel>Número Telefónico</FormLabel>
        <div className="flex gap-2">
          <FormField
            control={form.control}
            name="codigoPais"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="País" />
                </SelectTrigger>
                <SelectContent>
                  {countryCodes.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      {country.name} {country.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />

          <FormField
            control={form.control}
            name="telefono"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input placeholder="10 dígitos" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </FormItem>
    </>
  );
}
