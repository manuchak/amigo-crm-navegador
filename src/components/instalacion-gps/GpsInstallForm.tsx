
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

// Nueva lista de features clave inspirada en plataformas de gestión de flotas modernas (ejemplo Wialon)
const GPS_FEATURE_OPTIONS = [
  { label: "Sensor de puertas", value: "sensor_puertas" },
  { label: "Sensor de temperatura", value: "sensor_temperatura" },
  { label: "Sensor de combustible", value: "sensor_combustible" },
  { label: "Corte de motor (relay)", value: "relay" },
  { label: "Sensor de apertura de caja", value: "sensor_apertura_caja" },
  { label: "Botón de pánico", value: "panico" },
  { label: "Identificación de conductor (iButton/RFID)", value: "driver_id" },
  { label: "Sensor de vibración", value: "sensor_vibracion" },
  { label: "Sensor de movimiento", value: "sensor_movimiento" },
  { label: "Detección de inhibidor (jamming)", value: "anti_jammer" },
  { label: "Sirena", value: "sirena" },
  { label: "Micrófono", value: "microfono" },
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

            {/* Funcionalidades adicionales (UX optimizada) */}
            <FormItem>
              <FormLabel>¿Qué funcionalidades adicionales instalarás?</FormLabel>
              <p className="text-muted-foreground text-xs mb-2">
                Selecciona una o más funcionalidades del GPS que sean relevantes para la operación de este vehículo de carga.
              </p>
              <Controller
                control={form.control}
                name="gpsFeatures"
                render={({ field }) => (
                  <div className="flex flex-wrap gap-2">
                    {GPS_FEATURE_OPTIONS.map((option) => (
                      <Button
                        key={option.value}
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

