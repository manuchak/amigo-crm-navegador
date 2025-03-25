
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { YearSelection } from "./YearSelection";
import { LeadFormValues } from "./types";

type QualificationsFormProps = {
  form: UseFormReturn<LeadFormValues>;
  watchTieneCarro: "SI" | "NO";
};

export function QualificationsForm({ form, watchTieneCarro }: QualificationsFormProps) {
  return (
    <>
      <FormField
        control={form.control}
        name="tieneCarroPropio"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>¿Tiene carro propio?</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex space-x-4"
              >
                <FormItem className="flex items-center space-x-2 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="SI" />
                  </FormControl>
                  <FormLabel className="font-normal">Sí</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-2 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="NO" />
                  </FormControl>
                  <FormLabel className="font-normal">No</FormLabel>
                </FormItem>
              </RadioGroup>
            </FormControl>
          </FormItem>
        )}
      />

      {watchTieneCarro === "SI" && <YearSelection form={form} />}

      <FormField
        control={form.control}
        name="experienciaSeguridad"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>¿Ha trabajado en el sector de seguridad?</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex space-x-4"
              >
                <FormItem className="flex items-center space-x-2 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="SI" />
                  </FormControl>
                  <FormLabel className="font-normal">Sí</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-2 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="NO" />
                  </FormControl>
                  <FormLabel className="font-normal">No</FormLabel>
                </FormItem>
              </RadioGroup>
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="credencialSedena"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>¿Tiene credencial de la SEDENA?</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex space-x-4"
              >
                <FormItem className="flex items-center space-x-2 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="SI" />
                  </FormControl>
                  <FormLabel className="font-normal">Sí</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-2 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="NO" />
                  </FormControl>
                  <FormLabel className="font-normal">No</FormLabel>
                </FormItem>
              </RadioGroup>
            </FormControl>
          </FormItem>
        )}
      />
    </>
  );
}
