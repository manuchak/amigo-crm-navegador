import React from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card, CardContent, CardHeader, CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Car } from "lucide-react";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { useCarData } from "@/hooks/useCarData";

// Nueva lista de funcionalidades basada en hardware de seguimiento profesional y referencias de Wialon
const GPS_FEATURE_OPTIONS = [
  { label: "Detección de eventos (ignición/paro de motor)", value: "ignition_event" },
  { label: "Corte remoto de motor (relay)", value: "engine_cut" },
  { label: "Sensor de puertas", value: "door_sensor" },
  { label: "Botón de pánico", value: "panic_button" },
  { label: "Identificación de conductor (iButton, RFID)", value: "driver_id" },
  { label: "Sensor de temperatura", value: "temperature_sensor" },
  { label: "Sensor de combustible/sonda (nivel y robos)", value: "fuel_sensor" },
  { label: "Apertura de caja o remolque", value: "cargo_door_sensor" },
  { label: "Sensor de movimiento/vibración", value: "motion_sensor" },
  { label: "Anti-jammer (detección de inhibidor)", value: "anti_jammer" },
  { label: "Sirena audible", value: "siren" },
  { label: "Micrófono para escucha remota", value: "microphone" },
  { label: "Inmovilizador", value: "immobilizer" },
  { label: "Sensor de fatiga/conducta (driver monitor)", value: "driver_monitor" },
];

const gpsInstallSchema = z.object({
  ownerName: z.string().min(2, "Campo requerido"),
  vehiclePlate: z.string().min(4, "Campo requerido"),
  brand: z.string().min(2, "Campo requerido"),
  model: z.string().min(1, "Campo requerido"),
  year: z.string().min(4, "Campo requerido"),
  type: z.enum(["fijo", "dashcam"]),
  gpsFeatures: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

type GpsInstallFormProps = {
  onNext: (data: z.infer<typeof gpsInstallSchema>) => void;
};

export default function GpsInstallForm({ onNext }: GpsInstallFormProps) {
  const { brands, fetchModelsByBrand, loading: loadingBrands } = useCarData();
  const [models, setModels] = React.useState<{ id: number; brand_id: number; name: string }[]>([]);
  const [brandId, setBrandId] = React.useState<number | null>(null);

  const form = useForm<z.infer<typeof gpsInstallSchema>>({
    resolver: zodResolver(gpsInstallSchema),
    defaultValues: {
      type: "fijo",
      gpsFeatures: [],
    },
  });

  React.useEffect(() => {
    async function fetchModels() {
      if (!brandId) return setModels([]);
      const result = await fetchModelsByBrand(brandId);
      setModels(result);
      if (!result.some(m => m.name === form.getValues("model"))) {
        form.setValue("model", "");
      }
    }
    fetchModels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brandId]);

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

              {/* SELECT DE MARCAS */}
              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Marca</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        const selectedBrand = brands.find(b => b.name === value);
                        if (selectedBrand) {
                          setBrandId(selectedBrand.id);
                        } else {
                          setBrandId(null);
                        }
                      }}
                      disabled={loadingBrands}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una marca" />
                      </SelectTrigger>
                      <SelectContent>
                        {brands.map(b => (
                          <SelectItem value={b.name} key={b.id}>{b.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* SELECT DE MODELOS */}
              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Modelo</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={!brandId || models.length === 0}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={brandId ? "Selecciona modelo" : "Selecciona marca primero"} />
                      </SelectTrigger>
                      <SelectContent>
                        {models.map(m => (
                          <SelectItem value={m.name} key={m.id}>{m.name}</SelectItem>
                        ))}
                        <SelectItem value="Otro">Otro</SelectItem>
                      </SelectContent>
                    </Select>
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

            {/* Funcionalidades adicionales mejoradas */}
            <FormItem>
              <FormLabel>Selecciona las funciones del GPS para este vehículo</FormLabel>
              <p className="text-muted-foreground text-xs mb-2">
                Marca las opciones relevantes que reflejan el hardware y necesidades de esta unidad de transporte. Consulta la hoja técnica del equipo antes de seleccionar.
              </p>
              <Controller
                control={form.control}
                name="gpsFeatures"
                render={({ field }) => (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {GPS_FEATURE_OPTIONS.map((option) => (
                      <Button
                        key={option.value}
                        type="button"
                        size="sm"
                        variant={field.value?.includes(option.value) ? "default" : "outline"}
                        className="rounded-full flex justify-start"
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
                    ))}
                  </div>
                )}
              />
              <FormMessage />
            </FormItem>

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
