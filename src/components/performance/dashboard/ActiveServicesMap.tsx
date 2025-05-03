
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { ActiveService } from './types';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertCircle, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActiveServicesMapProps {
  services: ActiveService[];
  selectedServiceId?: string;
  onServiceSelect: (id: string) => void;
}

const riskZones = [
  { center: [-99.1447, 19.3827], radius: 0.03 }, // Example risk zone in CDMX
  { center: [-99.2029, 19.4326], radius: 0.025 }, // Another example risk zone
  { center: [-99.0856, 19.4091], radius: 0.022 }, // Third example risk zone
];

export function ActiveServicesMap({ services, selectedServiceId, onServiceSelect }: ActiveServicesMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({});
  
  useEffect(() => {
    if (!mapContainer.current) return;
    
    // Initialize map
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
    
    // Add risk zones when map loads
    map.current.on('load', () => {
      if (!map.current) return;
      
      // Add risk zones as circles
      riskZones.forEach((zone, index) => {
        const id = `risk-zone-${index}`;
        
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
      });
    });
    
    return () => {
      map.current?.remove();
    };
  }, []);
  
  // Update markers when services change
  useEffect(() => {
    if (!map.current) return;
    
    // Remove old markers
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
    
    // Draw routes if available
    services.forEach(service => {
      if (service.id === selectedServiceId && service.routeCoordinates && service.routeCoordinates.length > 1) {
        // Add route line if not exists
        if (!map.current?.getSource('route')) {
          map.current?.addSource('route', {
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
          
          map.current?.addLayer({
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
          (map.current?.getSource('route') as mapboxgl.GeoJSONSource)?.setData({
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
        map.current?.fitBounds(bounds, { padding: 80 });
      }
    }); 
  }, [services, selectedServiceId, onServiceSelect]);
  
  // Center map on selected service
  useEffect(() => {
    if (!map.current || !selectedServiceId) return;
    
    const service = services.find(s => s.id === selectedServiceId);
    if (service?.currentLocation?.coordinates) {
      map.current.flyTo({
        center: service.currentLocation.coordinates,
        zoom: 14,
        essential: true
      });
    }
  }, [selectedServiceId, services]);

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden border">
      <div ref={mapContainer} className="absolute inset-0" />
      
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
