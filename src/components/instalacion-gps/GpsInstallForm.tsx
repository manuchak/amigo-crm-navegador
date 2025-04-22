
import React from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card, CardContent, CardHeader, CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Car, MapPin, Calendar, Timer } from "lucide-react";

const gpsInstallSchema = z.object({
  ownerName: z.string().min(2, "Campo requerido"),
  vehiclePlate: z.string().min(4, "Campo requerido"),
  brand: z.string().min(2, "Campo requerido"),
  model: z.string().min(2, "Campo requerido"),
  year: z.string().min(4, "Campo requerido"),
  type: z.enum(["fijo", "dashcam"]),
  extraSensors: z.array(z.string()).optional(),
  notes: z.string().optional(),
  requiresRelay: z.boolean().optional(),
  requiresSiren: z.boolean().optional(),
  requiresMicrophone: z.boolean().optional(),
});

type GpsInstallFormProps = {
  onNext: (data: z.infer<typeof gpsInstallSchema>) => void;
};
const SENSOR_OPTIONS = [
  { label: "Sensor de puertas", value: "sensor_puertas" },
  { label: "Sensor de temperatura", value: "sensor_temperatura" },
  { label: "Sensor de combustible", value: "sensor_combustible" },
  { label: "Corte de motor (relay)", value: "relay" },
  { label: "Sirena", value: "sirena" },
  { label: "Micrófono", value: "microfono" },
];

export default function GpsInstallForm({ onNext }: GpsInstallFormProps) {
  const form = useForm<z.infer<typeof gpsInstallSchema>>({
    resolver: zodResolver(gpsInstallSchema),
    defaultValues: {
      type: "fijo",
      extraSensors: [],
      requiresRelay: false,
      requiresSiren: false,
      requiresMicrophone: false,
    },
  });

  const { watch } = form;

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl my-4">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-br from-green-400 to-green-700 rounded-full p-2">
            <Car className="text-white w-6 h-6" />
          </div>
          <CardTitle>Datos de la Instalación del GPS</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            className="space-y-5"
            onSubmit={form.handleSubmit(onNext)}
            autoComplete="off"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="ownerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre Cliente / Custodio</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre completo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="vehiclePlate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Placa del Vehículo</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: ABC1234" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Marca</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Toyota" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Modelo</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Hilux" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Año</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: 2023" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de instalación</FormLabel>
                    <FormControl>
                      <div className="flex gap-3">
                        <Button
                          type="button"
                          onClick={() => form.setValue("type", "fijo")}
                          variant={field.value === "fijo" ? "default" : "outline"}
                          className="flex-1"
                        >
                          GPS Fijo
                        </Button>
                        <Button
                          type="button"
                          onClick={() => form.setValue("type", "dashcam")}
                          variant={field.value === "dashcam" ? "default" : "outline"}
                          className="flex-1"
                        >
                          Dashcam/GPS
                        </Button>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <FormItem>
              <FormLabel>Sensores adicionales a instalar</FormLabel>
              <div className="flex flex-wrap gap-2 mt-2">
                {SENSOR_OPTIONS.map((option) => (
                  <Controller
                    key={option.value}
                    control={form.control}
                    name="extraSensors"
                    render={({ field }) => (
                      <Button
                        type="button"
                        size="sm"
                        variant={field.value?.includes(option.value) ? "default" : "outline"}
                        className="rounded-full"
                        onClick={() => {
                          const v = field.value ?? [];
                          if (v.includes(option.value)) {
                            field.onChange(v.filter((s: string) => s !== option.value));
                          } else {
                            field.onChange([...v, option.value]);
                          }
                        }}
                      >
                        {option.label}
                      </Button>
                    )}
                  />
                ))}
              </div>
            </FormItem>

            <div className="flex flex-wrap gap-5">
              <FormField
                control={form.control}
                name="requiresRelay"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-3">
                    <FormLabel className="mb-0">¿Agregar relay (corte motor)?</FormLabel>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        id="relay-switch"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="requiresSiren"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-3">
                    <FormLabel className="mb-0">¿Agregar sirena?</FormLabel>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        id="siren-switch"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="requiresMicrophone"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-3">
                    <FormLabel className="mb-0">¿Agregar micrófono?</FormLabel>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        id="microphone-switch"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas para el técnico</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Especificaciones adicionales y observaciones…" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 mt-4">
              <Button type="submit" className="px-10">Siguiente</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
