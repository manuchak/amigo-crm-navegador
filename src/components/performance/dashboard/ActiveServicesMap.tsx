
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

// Risk zones defined outside component to avoid recreation on each render
// Using coordinates for Puebla, Tlaxcala, Veracruz, and Arco Norte
const riskZones = [
  { center: [-98.2063, 19.0414], radius: 0.05, name: "Puebla" },              // Puebla
  { center: [-98.2370, 19.3139], radius: 0.04, name: "Tlaxcala" },            // Tlaxcala
  { center: [-96.1342, 19.1738], radius: 0.06, name: "Veracruz" },            // Veracruz
  { center: [-99.0045, 19.7128], radius: 0.035, name: "Arco Norte" },         // Arco Norte (approximate)
  { center: [-98.5823, 19.5633], radius: 0.04, name: "Arco Norte - Este" },   // Arco Norte section
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
      // Use the updated token
      mapboxgl.accessToken = 'pk.eyJ1IjoiZGV0ZWN0YXNlYyIsImEiOiJjbTlzdjg3ZmkwNGVoMmpwcGg3MWMwNXlhIn0.zIQ8khHoZsJt8bL4jXf35Q';
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [-98.5795, 19.3910], // Center between Puebla, Tlaxcala, Veracruz
        zoom: 7.5,
        pitchWithRotate: false,
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
        
        // Add risk zones after map is fully loaded
        riskZones.forEach((zone, index) => {
          const id = `risk-zone-${index}`;
          
          // Add source for this risk zone
          map.current?.addSource(id, {
            type: 'geojson',
            data: {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: zone.center
              },
              properties: {
                name: zone.name
              }
            }
          });
          
          // Add layer for this risk zone
          map.current?.addLayer({
            id: id,
            type: 'circle',
            source: id,
            paint: {
              'circle-radius': zone.radius * 10000,
              'circle-color': 'rgba(255, 0, 0, 0.15)',
              'circle-stroke-width': 1.5,
              'circle-stroke-color': 'rgba(255, 0, 0, 0.5)',
            }
          });
          
          // Add popup for risk zone name
          const popup = new mapboxgl.Popup({
            closeButton: false,
            closeOnClick: false,
            offset: 15,
            className: 'risk-zone-popup'
          });
          
          map.current?.on('mouseenter', id, (e) => {
            if (!map.current) return;
            map.current.getCanvas().style.cursor = 'pointer';
            
            const coordinates = zone.center;
            const description = `<div class="text-sm font-medium text-red-500">Zona de riesgo: ${zone.name}</div>`;
            
            popup.setLngLat(coordinates)
              .setHTML(description)
              .addTo(map.current);
          });
          
          map.current?.on('mouseleave', id, () => {
            if (!map.current) return;
            map.current.getCanvas().style.cursor = '';
            popup.remove();
          });
        });
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
        
        // Create marker element with improved styling
        const markerEl = document.createElement('div');
        markerEl.className = cn(
          'w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg transition-all duration-300',
          selectedServiceId === service.id ? 'border-[3px] border-primary scale-110' : 'border border-gray-200'
        );
        
        // Add status indicator
        const statusIndicator = document.createElement('div');
        statusIndicator.className = cn(
          'w-5 h-5 rounded-full transition-colors',
          service.inRiskZone ? "bg-red-500" : service.delayRisk ? "bg-amber-500" : "bg-green-500"
        );
        markerEl.appendChild(statusIndicator);
        
        // Add ID label
        const idLabel = document.createElement('div');
        idLabel.className = 'absolute -bottom-5 bg-white px-1.5 py-0.5 rounded text-xs font-medium shadow-sm';
        idLabel.textContent = `#${service.id}`;
        markerEl.appendChild(idLabel);
        
        // Create popup for marker
        const popup = new mapboxgl.Popup({
          offset: 25,
          closeButton: false,
          closeOnClick: false,
          className: 'service-marker-popup'
        }).setHTML(`
          <div class="p-2">
            <div class="font-medium">Servicio #${service.id}</div>
            <div class="text-sm text-muted-foreground">${service.custodioName}</div>
            <div class="text-xs mt-1">
              <span class="font-medium">ETA:</span> ${service.eta}
            </div>
          </div>
        `);
        
        // Create and add the marker
        const marker = new mapboxgl.Marker(markerEl)
          .setLngLat(service.currentLocation.coordinates)
          .setPopup(popup)
          .addTo(map.current!);
        
        // Add hover events
        markerEl.addEventListener('mouseenter', () => {
          popup.addTo(map.current!);
        });
        
        markerEl.addEventListener('mouseleave', () => {
          popup.remove();
        });
        
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
        // Center map on the selected service with smooth animation
        map.current.flyTo({
          center: service.currentLocation.coordinates,
          zoom: 12,
          essential: true,
          speed: 0.8,
          curve: 1
        });
        
        // Draw route if available
        if (service.routeCoordinates && service.routeCoordinates.length > 1) {
          // Setup the route source and layer if they don't exist yet
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
            
            // Add route line layer
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
                'line-width': 4,
                'line-opacity': 0.8,
                'line-dasharray': [0.2, 1]
              }
            });
            
            // Add direction arrows on the route
            map.current.addLayer({
              id: 'route-arrows',
              type: 'symbol',
              source: 'route',
              layout: {
                'symbol-placement': 'line',
                'symbol-spacing': 100,
                'icon-image': 'arrow',
                'icon-size': 0.5,
                'icon-rotate': 90,
                'icon-rotation-alignment': 'map',
                'icon-allow-overlap': true,
                'icon-ignore-placement': true
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
          
          // Fit bounds to show the entire route with padding
          const bounds = new mapboxgl.LngLatBounds();
          service.routeCoordinates.forEach(coord => bounds.extend(coord as mapboxgl.LngLatLike));
          map.current.fitBounds(bounds, { padding: 100, maxZoom: 13 });
        }
      }
    } catch (error) {
      console.error('Error updating route:', error);
    }
  }, [selectedServiceId, services, mapLoaded]);

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden border shadow-sm bg-card">
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
      
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm p-2.5 rounded-lg shadow-md border border-border/50">
        <div className="text-xs font-medium mb-1.5 text-muted-foreground">Leyenda</div>
        <div className="flex flex-col space-y-1.5">
          <Badge className="bg-green-500 flex items-center gap-1.5 shadow-sm py-1">
            <div className="w-2 h-2 rounded-full bg-white/90" />
            <span>En tiempo</span>
          </Badge>
          <Badge className="bg-amber-500 flex items-center gap-1.5 shadow-sm py-1">
            <div className="w-2 h-2 rounded-full bg-white/90" />
            <span>Riesgo de retraso</span>
          </Badge>
          <Badge className="bg-red-500 flex items-center gap-1.5 shadow-sm py-1">
            <div className="w-2 h-2 rounded-full bg-white/90" />
            <span>Zona de riesgo</span>
          </Badge>
        </div>
      </div>
    </div>
  );
}
