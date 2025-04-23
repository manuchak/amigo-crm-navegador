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
import VehiclesFieldArray from "./VehiclesFieldArray";
import AddressSection from "./address/AddressSection";
import { InstallerRegisterForm, InstallersList } from "./installers";
import { useAuth } from "@/context/AuthContext";

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
  installInWorkshop: z.boolean().optional(),
  vehicles: z.array(vehicleSchema).min(1)
});

type GpsInstallFormProps = {
  onNext: (data: z.infer<typeof gpsInstallSchema>) => void;
};

export default function GpsInstallForm(props: any) {
  const { brands, fetchModelsByBrand, loading: loadingBrands } = useCarData();
  const { userData } = useAuth();
  const isAdmin = userData?.role === "admin" || userData?.role === "owner";

  const form = useForm<z.infer<typeof gpsInstallSchema>>({
    resolver: zodResolver(gpsInstallSchema),
    defaultValues: {
      ownerName: "",
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
      ]
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
    props.onNext({ ...data, vehicles: enrichedVehicles });
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
      {isAdmin && (
        <section className="mt-8">
          <InstallerRegisterForm onRegistered={() => {}} />
          <InstallersList />
        </section>
      )}
    </div>
  );
}
