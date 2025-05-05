
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { ActiveService } from '../types';
import { cn } from '@/lib/utils';
import { MapErrorDisplay } from './MapErrorDisplay';
import { useRiskZones } from './hooks/useRiskZones';
import { useMapMarkers } from './hooks/useMapMarkers';
import { useRouteDisplay } from './hooks/useRouteDisplay';

interface MapContainerProps {
  services: ActiveService[];
  selectedServiceId?: string;
  onServiceSelect: (id: string) => void;
}

export function MapContainer({ services, selectedServiceId, onServiceSelect }: MapContainerProps) {
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
      
      // Add navigation controls (making them smaller and in bottom-right)
      map.current.addControl(
        new mapboxgl.NavigationControl({
          showCompass: true,
          visualizePitch: false,
          showZoom: true,
        }),
        'bottom-right'
      );
      
      // Handle map errors
      map.current.on('error', (e) => {
        console.error('Mapbox error:', e);
        setMapError(`Error loading map: ${e.error?.message || 'Unknown error'}`);
      });
      
      // Wait until the map is fully loaded before adding sources and layers
      map.current.on('load', () => {
        console.log('Map style loaded successfully');
        setMapLoaded(true);
        
        // Resize the map to ensure it fills the container properly
        if (map.current) {
          map.current.resize();
        }
      });
    } catch (error) {
      console.error('Error initializing map:', error);
      setMapError(`Error initializing map: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    // Ensure map resizes when window size changes
    const handleResize = () => {
      if (map.current) {
        map.current.resize();
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);
  
  // Add risk zones to the map
  const { addRiskZones } = useRiskZones(map, mapLoaded);
  
  // Effect to add risk zones
  useEffect(() => {
    if (mapLoaded && map.current) {
      addRiskZones();
    }
  }, [mapLoaded, addRiskZones]);

  // Update markers when services change
  const { updateMarkers } = useMapMarkers(map, mapLoaded, markersRef, onServiceSelect, selectedServiceId);
  
  useEffect(() => {
    if (map.current && mapLoaded) {
      updateMarkers(services);
    }
  }, [services, selectedServiceId, updateMarkers, mapLoaded]);
  
  // Update route display when selected service changes
  const { updateRouteDisplay } = useRouteDisplay(map, mapLoaded);
  
  useEffect(() => {
    if (map.current && mapLoaded) {
      updateRouteDisplay(services, selectedServiceId);
    }
  }, [selectedServiceId, services, mapLoaded, updateRouteDisplay]);

  if (mapError) {
    return <MapErrorDisplay errorMessage={mapError} />;
  }

  return <div ref={mapContainer} className="absolute inset-0" />;
}
