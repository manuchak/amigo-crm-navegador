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
import DashcamFeatures from "./DashcamFeatures";
import { Checkbox } from "@/components/ui/checkbox";

const GPS_FEATURE_OPTIONS = [
  { label: "Seguimiento en tiempo real", value: "realtime_tracking" },
  { label: "Alertas de geocercas (entrada/salida)", value: "geofence_alerts" },
  { label: "Corte remoto de motor", value: "engine_cut" },
  { label: "Detección de encendido/apagado de motor", value: "ignition_event" },
  { label: "Reporte de recorridos y paradas", value: "trip_report" },
  { label: "Sensor de puertas", value: "door_sensor" },
  { label: "Botón de pánico", value: "panic_button" },
  { label: "Identificación de conductor (iButton, RFID)", value: "driver_id" },
  { label: "Sensor de temperatura", value: "temperature_sensor" },
  { label: "Sensor de combustible/robo", value: "fuel_sensor" },
  { label: "Sensor de movimiento/vibración", value: "motion_sensor" },
  { label: "Anti-jammer", value: "anti_jammer" },
  { label: "Inmovilizador", value: "immobilizer" },
  { label: "Micrófono remoto", value: "microphone" },
  { label: "Sirena", value: "siren" },
  { label: "Sensor de fatiga/conducta", value: "driver_monitor" }
];

const DASHCAM_FEATURE_OPTIONS = [
  { label: "ADAS (Asistencia Avanzada Conducción)", value: "adas" },
  { label: "DMS (Monitoreo de Fatiga/Distraído)", value: "dms" },
  { label: "Transmisión en tiempo real de video", value: "streaming" },
  { label: "Grabación de video local", value: "local_recording" },
  { label: "Reconocimiento de matrículas (LPR)", value: "lpr" },
  { label: "Alerta de desvío de carril (LDW)", value: "lane_departure" },
  { label: "Alerta de colisión frontal (FCW)", value: "forward_collision" },
  { label: "Audio en cabina (altavoz/mic)", value: "audio" },
  { label: "Alerta de uso de celular/cigarro", value: "alert_smoking" },
  { label: "Video en cabina", value: "cabin_video" }
];

const gpsInstallSchema = z.object({
  ownerName: z.string().min(2, "Campo requerido"),
  vehiclePlate: z.string().min(4, "Campo requerido"),
  brand: z.string().min(2, "Campo requerido"),
  model: z.string().min(1, "Campo requerido"),
  year: z.string().min(4, "Campo requerido"),
  type: z.enum(["fijo", "dashcam"]),
  gpsFeatures: z.array(z.string()).optional(),
  dashcamFeatures: z.array(z.string()).optional(),
  dashcamCameraCount: z.number().min(1).max(6).optional(),
  dashcamCameraLocations: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

type GpsInstallFormProps = {
  onNext: (data: z.infer<typeof gpsInstallSchema>) => void;
};

export default function GpsInstallForm({ onNext }: GpsInstallFormProps) {
  const { brands, fetchModelsByBrand, loading: loadingBrands } = useCarData();
  const [models, setModels] = React.useState<{ id: number; brand_id: number; name: string }[]>([]);
  const [brandId, setBrandId] = React.useState<number | null>(null);
  const [dashcamFeatures, setDashcamFeatures] = React.useState<string[]>([]);
  const [dashcamCameraCount, setDashcamCameraCount] = React.useState<number>(2);
  const [dashcamCameraLocations, setDashcamCameraLocations] = React.useState<string[]>([]);

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

  const handleNext = (data: z.infer<typeof gpsInstallSchema>) => {
    if (data.type === "dashcam") {
      onNext({
        ...data,
        dashcamFeatures,
        dashcamCameraCount,
        dashcamCameraLocations,
      });
    } else {
      onNext(data);
    }
  };

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
            onSubmit={form.handleSubmit(handleNext)}
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

            {(form.watch("type") === "fijo") && (
              <FormItem>
                <FormLabel>
                  Selecciona las funciones del GPS para este vehículo
                </FormLabel>
                <p className="text-muted-foreground text-xs mb-2">
                  Marca solo las funciones realmente necesarias. Las funciones aquí mostradas reflejan las capacidades principales en plataformas modernas (ej: Wialon).
                </p>
                <Controller
                  control={form.control}
                  name="gpsFeatures"
                  render={({ field }) => (
                    <div className="flex flex-col gap-1 max-w-2xl">
                      {GPS_FEATURE_OPTIONS.map((option) => (
                        <label
                          key={option.value}
                          className="flex items-center gap-2 p-1 rounded-md cursor-pointer hover:bg-slate-50 select-none"
                          style={{ maxWidth: 520 }}
                        >
                          <Checkbox
                            checked={field.value?.includes(option.value)}
                            onCheckedChange={() => {
                              const v = field.value ?? [];
                              if (v.includes(option.value)) {
                                field.onChange(v.filter((s: string) => s !== option.value));
                              } else {
                                field.onChange([...v, option.value]);
                              }
                            }}
                            id={`gps-feature-${option.value}`}
                          />
                          <span className="text-xs text-gray-800">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  )}
                />
                <FormMessage />
              </FormItem>
            )}

            {(form.watch("type") === "dashcam") && (
              <FormItem>
                <FormLabel>
                  Selecciona funciones de la Dashcam / cámaras
                </FormLabel>
                <p className="text-muted-foreground text-xs mb-2">
                  Elige funciones avanzadas reales de video telemático, cantidad y ubicaciones de cámaras. ADAS (asistencia avanzada), DMS (monitoreo conductor), etc.
                </p>
                <DashcamFeatures
                  features={dashcamFeatures}
                  onFeatureChange={setDashcamFeatures}
                  cameraCount={dashcamCameraCount}
                  setCameraCount={setDashcamCameraCount}
                  cameraPositions={dashcamCameraLocations}
                  setCameraPositions={setDashcamCameraLocations}
                />
                <div className="pt-2 text-xs text-muted-foreground">
                  Si requieres especificaciones adicionales, agrégalas en las notas del formulario.
                </div>
              </FormItem>
            )}

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
