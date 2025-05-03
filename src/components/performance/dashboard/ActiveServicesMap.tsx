
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { ActiveService } from './types';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertCircle, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ActiveServicesMapProps {
  services: ActiveService[];
  selectedServiceId?: string;
  onServiceSelect: (id: string) => void;
}

// Risk zones (mock data) - defined outside component to avoid recreation on each render
const riskZones = [
  { center: [-99.1447, 19.3827], radius: 0.03 }, // Example risk zone in CDMX
  { center: [-99.2029, 19.4326], radius: 0.025 }, // Another example risk zone
  { center: [-99.0856, 19.4091], radius: 0.022 }, // Third example risk zone
];

export function ActiveServicesMap({ services, selectedServiceId, onServiceSelect }: ActiveServicesMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({});
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  
  // Initialize map only once
  useEffect(() => {
    if (!mapContainer.current) return;
    
    try {
      // Initialize map
      // Use environment variable for production or a default token for development
      mapboxgl.accessToken = 'pk.eyJ1IjoibGVvbmFyZG9wY2UiLCJhIjoiY2tqZHc2NjZ5MGdmejJ5cWp4Z2NmbWF6eSJ9.Z_BwEDFyO7N_x-I-afk1aQ';
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [-99.1332, 19.4326], // Mexico City default center
        zoom: 11,
      });
      
      // Add navigation controls
      map.current.addControl(
        new mapboxgl.NavigationControl(),
        'bottom-right'
      );
      
      // Handle map errors
      map.current.on('error', (e) => {
        console.error('Mapbox error:', e);
        setMapError(`Error loading map: ${e.error?.message || 'Unknown error'}`);
        toast.error('Error al cargar el mapa', {
          description: 'Por favor verifique su conexión a internet y vuelva a intentar'
        });
      });
      
      // Wait until the map is fully loaded before adding sources and layers
      map.current.on('load', () => {
        console.log('Map style loaded successfully');
        setMapLoaded(true);
      });
    } catch (error) {
      console.error('Error initializing map:', error);
      setMapError(`Error initializing map: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Add risk zones after map style is fully loaded
  useEffect(() => {
    if (!map.current || !mapLoaded) return;
    
    try {
      // Add risk zones as circles
      riskZones.forEach((zone, index) => {
        const id = `risk-zone-${index}`;
        
        // Check if source already exists to avoid duplicate adds
        if (!map.current?.getSource(id)) {
          map.current?.addSource(id, {
            type: 'geojson',
            data: {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: zone.center
              },
              properties: {}
            }
          });
          
          map.current?.addLayer({
            id: id,
            type: 'circle',
            source: id,
            paint: {
              'circle-radius': zone.radius * 10000,
              'circle-color': 'rgba(255, 0, 0, 0.15)',
              'circle-stroke-width': 1,
              'circle-stroke-color': 'rgba(255, 0, 0, 0.5)',
            }
          });
        }
      });
    } catch (error) {
      console.error('Error adding risk zones:', error);
    }
  }, [mapLoaded]);
  
  // Update markers when services change
  useEffect(() => {
    if (!map.current || !mapLoaded) return;
    
    try {
      // Clear all existing markers
      Object.values(markersRef.current).forEach(marker => marker.remove());
      markersRef.current = {};
      
      // Add new markers for each service
      services.forEach(service => {
        // Skip if no coordinates
        if (!service.currentLocation?.coordinates) return;
        
        // Create custom marker element
        const markerEl = document.createElement('div');
        markerEl.className = cn(
          'w-6 h-6 bg-white rounded-full border-2 flex items-center justify-center shadow-md transition-all duration-300',
          selectedServiceId === service.id ? 'border-primary scale-125' : 'border-gray-300'
        );
        
        // Add status indicator
        const statusIndicator = document.createElement('div');
        statusIndicator.className = cn(
          'w-3 h-3 rounded-full',
          service.inRiskZone ? 'bg-red-500' : service.delayRisk ? 'bg-amber-500' : 'bg-green-500'
        );
        markerEl.appendChild(statusIndicator);
        
        // Create and add the marker
        const marker = new mapboxgl.Marker(markerEl)
          .setLngLat(service.currentLocation.coordinates)
          .addTo(map.current!);
        
        // Add click event
        markerEl.addEventListener('click', () => {
          onServiceSelect(service.id);
        });
        
        // Store marker reference
        markersRef.current[service.id] = marker;
      });
    } catch (error) {
      console.error('Error updating markers:', error);
    }
  }, [services, selectedServiceId, onServiceSelect, mapLoaded]);
  
  // Update route display when selected service changes
  useEffect(() => {
    if (!map.current || !mapLoaded || !selectedServiceId) return;
    
    try {
      const service = services.find(s => s.id === selectedServiceId);
      
      // Only proceed if we have a valid service with route coordinates
      if (service?.currentLocation?.coordinates) {
        // Center map on the selected service
        map.current.flyTo({
          center: service.currentLocation.coordinates,
          zoom: 14,
          essential: true
        });
        
        // Draw route if available
        if (service.routeCoordinates && service.routeCoordinates.length > 1) {
          // Check if route source exists
          if (!map.current.getSource('route')) {
            // Add new source and layer
            map.current.addSource('route', {
              type: 'geojson',
              data: {
                type: 'Feature',
                properties: {},
                geometry: {
                  type: 'LineString',
                  coordinates: service.routeCoordinates
                }
              }
            });
            
            map.current.addLayer({
              id: 'route',
              type: 'line',
              source: 'route',
              layout: {
                'line-join': 'round',
                'line-cap': 'round'
              },
              paint: {
                'line-color': '#16a34a',
                'line-width': 4
              }
            });
          } else {
            // Update existing route
            (map.current.getSource('route') as mapboxgl.GeoJSONSource).setData({
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: service.routeCoordinates
              }
            });
          }
          
          // Fit bounds to show the entire route
          const bounds = new mapboxgl.LngLatBounds();
          service.routeCoordinates.forEach(coord => bounds.extend(coord as mapboxgl.LngLatLike));
          map.current.fitBounds(bounds, { padding: 80 });
        }
      }
    } catch (error) {
      console.error('Error updating route:', error);
    }
  }, [selectedServiceId, services, mapLoaded]);

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden border">
      {mapError ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 text-center p-6">
          <div className="max-w-md">
            <AlertCircle className="h-10 w-10 text-amber-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Error al cargar el mapa</h3>
            <p className="text-sm text-muted-foreground">{mapError}</p>
            <p className="text-sm mt-4">Verifique su conexión a internet o que el token de Mapbox sea válido.</p>
          </div>
        </div>
      ) : (
        <div ref={mapContainer} className="absolute inset-0" />
      )}
      
      <div className="absolute bottom-4 left-4 space-y-2">
        <Badge className="bg-green-500 flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-white" />
          <span>En tiempo</span>
        </Badge>
        <Badge className="bg-amber-500 flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-white" />
          <span>Riesgo de retraso</span>
        </Badge>
        <Badge className="bg-red-500 flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-white" />
          <span>Zona de riesgo</span>
        </Badge>
      </div>
    </div>
  );
}
