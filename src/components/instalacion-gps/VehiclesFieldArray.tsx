
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import VehicleFormFields from "./VehicleFormFields";
import { useFieldArray, UseFormReturn } from "react-hook-form";

type VehiclesFieldArrayProps = {
  form: UseFormReturn<any>;
  brands: any[];
  loadingBrands: boolean;
  fetchModelsByBrand: (id: number) => Promise<any[]>;
  modelsArray: { [idx: number]: any[] };
  setModelsArray: React.Dispatch<React.SetStateAction<{ [idx: number]: any[] }>>;
  brandIds: { [idx: number]: number | null };
  setBrandIds: React.Dispatch<React.SetStateAction<{ [idx: number]: number | null }>>;
  dashcamFeaturesArr: { [idx: number]: string[] };
  setDashcamFeaturesArr: React.Dispatch<React.SetStateAction<{ [idx: number]: string[] }>>;
  dashcamCameraCountArr: { [idx: number]: number };
  setDashcamCameraCountArr: React.Dispatch<React.SetStateAction<{ [idx: number]: number }>>;
  dashcamCameraLocationsArr: { [idx: number]: string[] };
  setDashcamCameraLocationsArr: React.Dispatch<React.SetStateAction<{ [idx: number]: string[] }>>;
  GPS_FEATURE_OPTIONS: { label: string; value: string }[];
};

export default function VehiclesFieldArray({
  form,
  brands,
  loadingBrands,
  fetchModelsByBrand,
  modelsArray,
  setModelsArray,
  brandIds,
  setBrandIds,
  dashcamFeaturesArr,
  setDashcamFeaturesArr,
  dashcamCameraCountArr,
  setDashcamCameraCountArr,
  dashcamCameraLocationsArr,
  setDashcamCameraLocationsArr,
  GPS_FEATURE_OPTIONS
}: VehiclesFieldArrayProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "vehicles"
  });

  return (
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
            <VehicleFormFields
              idx={idx}
              form={form}
              brands={brands}
              loadingBrands={loadingBrands}
              modelsArray={modelsArray}
              brandIds={brandIds}
              fetchModelsByBrand={fetchModelsByBrand}
              setModelsArray={setModelsArray}
              setBrandIds={setBrandIds}
              dashcamFeaturesArr={dashcamFeaturesArr}
              setDashcamFeaturesArr={setDashcamFeaturesArr}
              dashcamCameraCountArr={dashcamCameraCountArr}
              setDashcamCameraCountArr={setDashcamCameraCountArr}
              dashcamCameraLocationsArr={dashcamCameraLocationsArr}
              setDashcamCameraLocationsArr={setDashcamCameraLocationsArr}
              GPS_FEATURE_OPTIONS={GPS_FEATURE_OPTIONS}
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
  );
}
