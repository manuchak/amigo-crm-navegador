
import React from "react";
import { Controller, UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import DashcamFeatures from "./DashcamFeatures";
import { Checkbox } from "@/components/ui/checkbox";

type VehicleFieldProps = {
  idx: number;
  form: UseFormReturn<any>;
  brands: any[];
  loadingBrands: boolean;
  modelsArray: { [idx: number]: any[] };
  brandIds: { [idx: number]: number | null };
  fetchModelsByBrand: (id: number) => Promise<any[]>;
  setModelsArray: React.Dispatch<React.SetStateAction<{ [idx: number]: any[] }>>;
  setBrandIds: React.Dispatch<React.SetStateAction<{ [idx: number]: number | null }>>;
  dashcamFeaturesArr: { [idx: number]: string[] };
  setDashcamFeaturesArr: React.Dispatch<React.SetStateAction<{ [idx: number]: string[] }>>;
  dashcamCameraCountArr: { [idx: number]: number };
  setDashcamCameraCountArr: React.Dispatch<React.SetStateAction<{ [idx: number]: number }>>;
  dashcamCameraLocationsArr: { [idx: number]: string[] };
  setDashcamCameraLocationsArr: React.Dispatch<React.SetStateAction<{ [idx: number]: string[] }>>;
  GPS_FEATURE_OPTIONS: { label: string; value: string }[];
};

export default function VehicleFormFields({
  idx,
  form,
  brands,
  loadingBrands,
  modelsArray,
  brandIds,
  fetchModelsByBrand,
  setModelsArray,
  setBrandIds,
  dashcamFeaturesArr,
  setDashcamFeaturesArr,
  dashcamCameraCountArr,
  setDashcamCameraCountArr,
  dashcamCameraLocationsArr,
  setDashcamCameraLocationsArr,
  GPS_FEATURE_OPTIONS
}: VehicleFieldProps) {
  return (
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
      {(form.watch(`vehicles.${idx}.type`) === "fijo") && (
        <FormItem className="mt-2 md:col-span-2">
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
        <FormItem className="mt-2 md:col-span-2">
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
          <FormItem className="md:col-span-2">
            <FormLabel>Notas para el técnico</FormLabel>
            <FormControl>
              <Textarea placeholder="Especificaciones adicionales y observaciones…" {...field} />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
}
