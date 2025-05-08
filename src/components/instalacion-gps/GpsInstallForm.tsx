import React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card, CardContent, CardHeader, CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Car } from "lucide-react";
import { useCarData } from "@/hooks/useCarData";
import VehiclesFieldArray from "./VehiclesFieldArray";
import AddressSection from "./address/AddressSection";
import InstallerWorkshopField from "./address/InstallerWorkshopField";
import { useAuth } from "@/context/auth"; // Updated import path
import { InstallerSelectMinimal } from "./installers/InstallerSelectMinimal";
import type { Tables } from "@/integrations/supabase/types";

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
  installAddress: z.object({
    state: z.string().min(2, "Campo requerido"),
    city: z.string().min(2, "Campo requerido"),
    colonia: z.string().optional(),
    street: z.string().min(2, "Campo requerido"),
    number: z.string().min(1, "Campo requerido"),
    postalCode: z.string().min(5, "Campo requerido"),
    phone: z.string().min(10, "Campo requerido"),
    references: z.string().optional(),
    coordinates: z.string().optional(),
  }),
  email: z.string().email("Correo electrónico inválido").optional().or(z.literal("")),
  installInWorkshop: z.boolean().optional(),
  vehicles: z.array(vehicleSchema).min(1),
  installerId: z.number().optional()
});

type GpsInstallFormProps = {
  onNext: (data: z.infer<typeof gpsInstallSchema>) => void;
  installer?: Tables<"gps_installers"> | null;
  onInstallerSelect?: (installer: Tables<"gps_installers"> | null) => void;
};

async function geocodeAddress(addressObj: any) {
  if (!addressObj || !addressObj.street || !addressObj.city || !addressObj.state) return null;
  const address = `${addressObj.street} ${addressObj.number || ""}, ${addressObj.colonia ? addressObj.colonia + "," : ""} ${addressObj.city}, ${addressObj.state}, México${addressObj.postalCode ? " " + addressObj.postalCode : ""}`;
  const resp = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      address
    )}.json?access_token=pk.eyJ1IjoiZGV0ZWN0YXNlYyIsImEiOiJjbTlzdjg3ZmkwNGVoMmpwcGg3MWMwNXlhIn0.zIQ8khHoZsJt8bL4jXf35Q&country=MX&language=es`
  );
  const data = await resp.json();
  if (data && data.features && data.features[0] && data.features[0].center) {
    const [lng, lat] = data.features[0].center;
    return `${lat},${lng}`;
  }
  return null;
}

export default function GpsInstallForm(props: GpsInstallFormProps) {
  const { installer, onNext, onInstallerSelect } = props;
  const { brands, fetchModelsByBrand, loading: loadingBrands } = useCarData();
  const { userData } = useAuth();

  const form = useForm<z.infer<typeof gpsInstallSchema>>({
    resolver: zodResolver(gpsInstallSchema),
    defaultValues: {
      ownerName: "",
      email: "",
      installAddress: {
        state: "",
        city: "",
        colonia: "",
        street: "",
        number: "",
        postalCode: "",
        phone: "",
        references: "",
        coordinates: ""
      },
      installInWorkshop: false,
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
      ],
      installerId: installer?.id
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "vehicles"
  });

  const [modelsArray, setModelsArray] = React.useState<{ [idx: number]: { id: number; brand_id: number; name: string }[] }>({});
  const [brandIds, setBrandIds] = React.useState<{ [idx: number]: number | null }>({}); 

  const [dashcamFeaturesArr, setDashcamFeaturesArr] = React.useState<{ [idx: number]: string[] }>({});
  const [dashcamCameraCountArr, setDashcamCameraCountArr] = React.useState<{ [idx: number]: number }>({});
  const [dashcamCameraLocationsArr, setDashcamCameraLocationsArr] = React.useState<{ [idx: number]: string[] }>({});

  React.useEffect(() => {
    const sub = form.watch(async (value, { name }) => {
      if (
        name &&
        name.startsWith("installAddress.") &&
        ["installAddress.street","installAddress.number","installAddress.colonia","installAddress.city","installAddress.state","installAddress.postalCode"].some(p => name === p)
      ) {
        const addr = form.getValues("installAddress");
        if (addr.street && addr.city && addr.state) {
          const coords = await geocodeAddress(addr);
          if (coords) {
            form.setValue("installAddress.coordinates", coords, { shouldDirty: true });
          }
        }
      }
    });
    return () => sub.unsubscribe?.();
  }, [form]);

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
  }, [fields.length, brands]);

  React.useEffect(() => {
    const val = form.watch("installInWorkshop");
    if (
      val &&
      installer &&
      installer.taller &&
      installer.taller_direccion
    ) {
      let tallerDirObj = null;
      if (typeof installer.taller_direccion === "object" && installer.taller_direccion !== null) {
        tallerDirObj = installer.taller_direccion;
      } else if (typeof installer.taller_direccion === "string") {
        try {
          tallerDirObj = JSON.parse(installer.taller_direccion);
        } catch {
          tallerDirObj = null;
        }
      }

      if (tallerDirObj && typeof tallerDirObj === "object") {
        form.setValue("installAddress.street", tallerDirObj.street ?? "");
        form.setValue("installAddress.number", tallerDirObj.number ?? "");
        form.setValue("installAddress.colonia", tallerDirObj.colonia ?? "");
        form.setValue("installAddress.postalCode", tallerDirObj.postalCode ?? "");
        form.setValue("installAddress.city", tallerDirObj.city ?? "");
        form.setValue("installAddress.state", tallerDirObj.state ?? "");
        if (tallerDirObj.street && tallerDirObj.city && tallerDirObj.state) {
          geocodeAddress(tallerDirObj).then(coords => {
            if (coords) form.setValue("installAddress.coordinates", coords, { shouldDirty: true });
          });
        }
      } else {
        const parseDir = (str: string) => {
          const cpMatch = str.match(/CP\s?(\d{5})/i);
          const postalCode = cpMatch ? cpMatch[1] : "";

          const parts = str.split(",").map(p => p.trim());
          let street = "", number = "", colonia = "", city = "", state = "";

          const numMatch = parts[0]?.match(/^(.*?)(?:\s*#\s*([0-9A-Za-z\-]+))?$/);
          if (numMatch) {
            street = numMatch[1]?.trim() || "";
            number = numMatch[2]?.trim() || "";
          }
          colonia = parts[1] && !/CP/i.test(parts[1]) && !/\d{5}/.test(parts[1]) ? parts[1] : "";
          if (parts.length >= 4) {
            city = parts[2] || "";
            state = parts[3] || "";
          } else if (parts.length === 3) {
            city = parts[1] || "";
            state = parts[2] || "";
          }

          return {
            street,
            number,
            colonia,
            postalCode,
            city,
            state
          };
        };

        const parsed = parseDir(installer.taller_direccion ?? "");
        form.setValue("installAddress.street", parsed.street);
        form.setValue("installAddress.number", parsed.number);
        form.setValue("installAddress.colonia", parsed.colonia);
        form.setValue("installAddress.postalCode", parsed.postalCode);
        form.setValue("installAddress.city", parsed.city);
        form.setValue("installAddress.state", parsed.state);
        if (parsed.street && parsed.city && parsed.state) {
          geocodeAddress(parsed).then(coords => {
            if (coords) form.setValue("installAddress.coordinates", coords, { shouldDirty: true });
          });
        }
      }
    }
  }, [form.watch("installInWorkshop"), installer]);

  React.useEffect(() => {
    if (installer?.id) {
      form.setValue("installerId", installer.id);
    } else {
      form.setValue("installerId", undefined);
    }
  }, [installer, form]);

  React.useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "installInWorkshop" && value.installInWorkshop === false) {
        form.setValue("installAddress.street", "");
        form.setValue("installAddress.number", "");
        form.setValue("installAddress.colonia", "");
        form.setValue("installAddress.postalCode", "");
        form.setValue("installAddress.city", "");
        form.setValue("installAddress.state", "");
        form.setValue("installAddress.references", "");
        form.setValue("installAddress.coordinates", "");
      }
    });
    return () => subscription.unsubscribe?.();
  }, [form]);

  const handleNext = (data: z.infer<typeof gpsInstallSchema>) => {
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
    <div>
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
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="installAddress.phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono de contacto</FormLabel>
                      <FormControl>
                        <Input placeholder="10 dígitos" maxLength={10} {...field} />
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
                      <FormLabel>Correo electrónico</FormLabel>
                      <FormControl>
                        <Input 
                          type="email" 
                          placeholder="ejemplo@correo.com" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <InstallerSelectMinimal 
                value={installer}
                onChange={(selectedInstaller) => {
                  if (onInstallerSelect) {
                    onInstallerSelect(selectedInstaller);
                  }
                  form.setValue("installerId", selectedInstaller?.id);
                }}
                onRegisterNew={() => {}}
                disabled={false}
              />

              <InstallerWorkshopField control={form.control} />
              <AddressSection control={form.control} />
              <VehiclesFieldArray
                form={form}
                brands={brands}
                loadingBrands={loadingBrands}
                fetchModelsByBrand={fetchModelsByBrand}
                modelsArray={modelsArray}
                setModelsArray={setModelsArray}
                brandIds={brandIds}
                setBrandIds={setBrandIds}
                dashcamFeaturesArr={dashcamFeaturesArr}
                setDashcamFeaturesArr={setDashcamFeaturesArr}
                dashcamCameraCountArr={dashcamCameraCountArr}
                setDashcamCameraCountArr={setDashcamCameraCountArr}
                dashcamCameraLocationsArr={dashcamCameraLocationsArr}
                setDashcamCameraLocationsArr={setDashcamCameraLocationsArr}
                GPS_FEATURE_OPTIONS={GPS_FEATURE_OPTIONS}
              />
              <div className="flex justify-end gap-3 mt-4">
                <Button type="submit" className="px-10">Siguiente</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
