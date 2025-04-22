
import React from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
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

// Opciones se mantienen igual
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

// Schema: el usuario es global, los vehículos como array
const vehicleSchema = z.object({
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

const gpsInstallSchema = z.object({
  ownerName: z.string().min(2, "Campo requerido"),
  vehicles: z.array(vehicleSchema).min(1)
});

type GpsInstallFormProps = {
  onNext: (data: z.infer<typeof gpsInstallSchema>) => void;
};

export default function GpsInstallForm({ onNext }: GpsInstallFormProps) {
  const { brands, fetchModelsByBrand, loading: loadingBrands } = useCarData();

  // Formulario RHF con array de vehículos
  const form = useForm<z.infer<typeof gpsInstallSchema>>({
    resolver: zodResolver(gpsInstallSchema),
    defaultValues: {
      ownerName: "",
      vehicles: [
        {
          vehiclePlate: "",
          brand: "",
          model: "",
          year: "",
          type: "fijo",
          gpsFeatures: [],
          notes: ""
        }
      ]
    }
  });

  // FieldArray para añadir vehículos
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "vehicles"
  });

  // Estado local para los modelos por marca (array porque hay varios vehículos)
  const [modelsArray, setModelsArray] = React.useState<{ [idx: number]: { id: number; brand_id: number; name: string }[] }>({});
  const [brandIds, setBrandIds] = React.useState<{ [idx: number]: number | null }>({}); 

  // Handles de dashcam (acorde a índice de vehículo)
  const [dashcamFeaturesArr, setDashcamFeaturesArr] = React.useState<{ [idx: number]: string[] }>({});
  const [dashcamCameraCountArr, setDashcamCameraCountArr] = React.useState<{ [idx: number]: number }>({});
  const [dashcamCameraLocationsArr, setDashcamCameraLocationsArr] = React.useState<{ [idx: number]: string[] }>({});

  // Manejo de actualización de modelos por marca y vehículo
  React.useEffect(() => {
    fields.forEach((field, idx) => {
      const brandValue = form.getValues(`vehicles.${idx}.brand`);
      const brandObj = brands.find(b => b.name === brandValue);
      if (brandObj && (!modelsArray[idx] || !brandIds[idx] || brandIds[idx] !== brandObj.id)) {
        fetchModelsByBrand(brandObj.id).then(result => {
          setModelsArray(ma => ({ ...ma, [idx]: result }));
          setBrandIds(bi => ({ ...bi, [idx]: brandObj.id }));
          const currentModel = form.getValues(`vehicles.${idx}.model`);
          if (!result.some(m => m.name === currentModel)) {
            form.setValue(`vehicles.${idx}.model`, "");
          }
        });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fields.length, brands]);

  // Reestructura datos del form cuando das siguiente
  const handleNext = (data: z.infer<typeof gpsInstallSchema>) => {
    // Adjuntar dashcam params para cada vehículo si aplica
    const enrichedVehicles = data.vehicles.map((veh, idx) => {
      if (veh.type === "dashcam") {
        return {
          ...veh,
          dashcamFeatures: dashcamFeaturesArr[idx] ?? [],
          dashcamCameraCount: dashcamCameraCountArr[idx] ?? 2,
          dashcamCameraLocations: dashcamCameraLocationsArr[idx] ?? [],
        };
      }
      return veh;
    });
    onNext({ ...data, vehicles: enrichedVehicles });
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
          <form className="space-y-5" onSubmit={form.handleSubmit(handleNext)} autoComplete="off">
            {/* Datos generales cliente/custodio */}
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

            {/* Múltiples vehículos - uno por bloque */}
            <div className="mt-4 space-y-8">
              {fields.map((field, idx) => (
                <Card className="bg-slate-50 border rounded-lg p-4 w-full relative" key={field.id}>
                  <CardHeader className="p-0 mb-3 flex-row items-center">
                    <div className="flex justify-between items-center w-full">
                      <span className="font-semibold text-sm text-violet-700">
                        Vehículo {idx + 1}
                      </span>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          className="text-red-400 px-3 py-0.5 text-xs"
                          onClick={() => remove(idx)}
                        >
                          Eliminar
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-0 flex flex-col gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <FormField
                        control={form.control}
                        name={`vehicles.${idx}.vehiclePlate`}
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
                        name={`vehicles.${idx}.brand`}
                        render={({ field: bField }) => (
                          <FormItem>
                            <FormLabel>Marca</FormLabel>
                            <Select
                              value={bField.value}
                              onValueChange={(value) => {
                                bField.onChange(value);
                                const selectedBrand = brands.find(b => b.name === value);
                                if (selectedBrand) {
                                  fetchModelsByBrand(selectedBrand.id).then(result => {
                                    setModelsArray(ma => ({ ...ma, [idx]: result }));
                                    setBrandIds(bi => ({ ...bi, [idx]: selectedBrand.id }));
                                    // Limpia modelo si ya no existe
                                    if (!result.some(m => m.name === form.getValues(`vehicles.${idx}.model`))) {
                                      form.setValue(`vehicles.${idx}.model`, "");
                                    }
                                  });
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
                        name={`vehicles.${idx}.model`}
                        render={({ field: mdlField }) => (
                          <FormItem>
                            <FormLabel>Modelo</FormLabel>
                            <Select
                              value={mdlField.value}
                              onValueChange={mdlField.onChange}
                              disabled={!brandIds[idx] || !modelsArray[idx] || modelsArray[idx]?.length === 0}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder={brandIds[idx] ? "Selecciona modelo" : "Selecciona marca primero"} />
                              </SelectTrigger>
                              <SelectContent>
                                {modelsArray[idx]?.map(m => (
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
                        name={`vehicles.${idx}.year`}
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
                        name={`vehicles.${idx}.type`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo de instalación</FormLabel>
                            <FormControl>
                              <div className="flex gap-3">
                                <Button
                                  type="button"
                                  onClick={() => form.setValue(`vehicles.${idx}.type`, "fijo")}
                                  variant={field.value === "fijo" ? "default" : "outline"}
                                  className="flex-1"
                                >
                                  GPS Fijo
                                </Button>
                                <Button
                                  type="button"
                                  onClick={() => form.setValue(`vehicles.${idx}.type`, "dashcam")}
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
                    {(form.watch(`vehicles.${idx}.type`) === "fijo") && (
                      <FormItem className="mt-2">
                        <FormLabel>
                          Selecciona las funciones del GPS para este vehículo
                        </FormLabel>
                        <p className="text-muted-foreground text-xs mb-2">
                          Marca solo las funciones necesarias.
                        </p>
                        <Controller
                          control={form.control}
                          name={`vehicles.${idx}.gpsFeatures`}
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
                                    id={`gps-feature-${option.value}-${idx}`}
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
                    {(form.watch(`vehicles.${idx}.type`) === "dashcam") && (
                      <FormItem className="mt-2">
                        <FormLabel>
                          Selecciona funciones de la Dashcam / cámaras
                        </FormLabel>
                        <DashcamFeatures
                          features={dashcamFeaturesArr[idx] ?? []}
                          onFeatureChange={(arr) => setDashcamFeaturesArr(obj => ({ ...obj, [idx]: arr }))}
                          cameraCount={dashcamCameraCountArr[idx] ?? 2}
                          setCameraCount={(n) => setDashcamCameraCountArr(obj => ({ ...obj, [idx]: n }))}
                          cameraPositions={dashcamCameraLocationsArr[idx] ?? []}
                          setCameraPositions={(arr) => setDashcamCameraLocationsArr(obj => ({ ...obj, [idx]: arr }))}
                        />
                      </FormItem>
                    )}
                    <FormField
                      control={form.control}
                      name={`vehicles.${idx}.notes`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notas para el técnico</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Especificaciones adicionales y observaciones…" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              ))}
              <div className="flex justify-end mt-2">
                <Button
                  type="button"
                  variant="subtle"
                  onClick={() => append({
                    vehiclePlate: "",
                    brand: "",
                    model: "",
                    year: "",
                    type: "fijo",
                    gpsFeatures: [],
                    notes: ""
                  })}
                  className="text-violet-700"
                >
                  + Agregar otro vehículo
                </Button>
              </div>
            </div>
            {/* Botón Siguiente */}
            <div className="flex justify-end gap-3 mt-4">
              <Button type="submit" className="px-10">Siguiente</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

// ...fin del archivo
