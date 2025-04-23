
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Pin } from "lucide-react";

// Para futuras versiones aquí incluiríamos un mapa real (ej: Mapbox/Google Maps)
// Ahora solo agregamos un campo coordenadas y un mensaje instructivo.
export default function MapInput({ control, name = "installAddress.coordinates" }: { control: any; name?: string }) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            <span className="flex items-center gap-1">
              <Pin className="w-4 h-4 text-emerald-600" /> Ubicación en mapa (opcional)
            </span>
          </FormLabel>
          <FormControl>
            <Input {...field} placeholder="Latitud, Longitud - Ej: 20.6736,-103.344" />
          </FormControl>
          <div className="text-xs text-muted-foreground mt-1">
            Pronto podrás seleccionar la ubicación directamente en un mapa interactivo.
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
