
import React, { useRef, useEffect } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

// Utiliza el token provisto por el usuario
const MAPBOX_TOKEN = "pk.eyJ1IjoiZGV0ZWN0YXNlYyIsImEiOiJjbTlzdjg3ZmkwNGVoMmpwcGg3MWMwNXlhIn0.zIQ8khHoZsJt8bL4jXf35Q";

export default function MapInputBox({ control, name = "installAddress.coordinates" }: { control: any; name?: string }) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            <span className="flex items-center gap-1">
              📍 Ubicación en mapa <span className="text-xs text-muted-foreground">(puedes acercar y mover el pin)</span>
            </span>
          </FormLabel>
          <FormControl>
            <div className="relative w-full h-64 rounded-lg overflow-hidden border">
              <div ref={mapContainer} className="absolute inset-0" />
            </div>
          </FormControl>
          <div className="text-xs text-muted-foreground mt-1">
            Elige la ubicación en el mapa, o mueve el pin a la posición correcta.
          </div>
          <FormMessage />
          <MapBox
            mapContainer={mapContainer}
            markerRef={markerRef}
            coordinates={field.value}
            onChange={field.onChange}
          />
        </FormItem>
      )}
    />
  );
}

// Componente auxiliar para renderizar mapbox fuera del render de react-hook-form
function MapBox({
  mapContainer,
  markerRef,
  coordinates,
  onChange,
}: {
  mapContainer: React.RefObject<HTMLDivElement>;
  markerRef: React.MutableRefObject<mapboxgl.Marker | null>;
  coordinates: string | undefined;
  onChange: (coords: string) => void;
}) {
  useEffect(() => {
    if (!mapContainer.current) return;
    if (typeof window === "undefined") return;
    mapboxgl.accessToken = MAPBOX_TOKEN;

    // Default: México centro
    const defaultLngLat: [number, number] = [-99.1332, 19.4326];

    // Parse prev value if any
    let lngLat: [number, number] = defaultLngLat;
    if (coordinates && coordinates.includes(",")) {
      const [lat, lng] = coordinates.split(",").map(Number);
      if (!isNaN(lat) && !isNaN(lng)) {
        lngLat = [lng, lat];
      }
    }

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: lngLat,
      zoom: 13,
    });

    if (markerRef.current) {
      markerRef.current.remove();
    }

    // Marcar y actualizar en drag
    const marker = new mapboxgl.Marker({ draggable: true }).setLngLat(lngLat).addTo(map);
    markerRef.current = marker;

    marker.on("dragend", () => {
      const lngLat = marker.getLngLat();
      // Guardar como "lat,lng"
      onChange(`${lngLat.lat},${lngLat.lng}`);
    });

    map.on("click", (e) => {
      marker.setLngLat(e.lngLat);
      onChange(`${e.lngLat.lat},${e.lngLat.lng}`);
    });

    // Cleanup
    return () => {
      map.remove();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapContainer]);

  // Sin render visual, solo side effects
  return null;
}
