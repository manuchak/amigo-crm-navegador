
import { useCallback, useRef } from 'react';
import mapboxgl from 'mapbox-gl';

// Risk zones defined outside component to avoid recreation on each render
// Using coordinates for Puebla, Tlaxcala, Veracruz, and Arco Norte
// Radius reduced to approximately 1km (0.01 degrees ≈ 1.1km at these latitudes)
const riskZones = [
  { center: [-98.2063, 19.0414], radius: 0.009, name: "Puebla" },              // Puebla
  { center: [-98.2370, 19.3139], radius: 0.008, name: "Tlaxcala" },            // Tlaxcala
  { center: [-96.1342, 19.1738], radius: 0.009, name: "Veracruz" },            // Veracruz
  { center: [-99.0045, 19.7128], radius: 0.009, name: "Arco Norte" },         // Arco Norte (approximate)
  { center: [-98.5823, 19.5633], radius: 0.008, name: "Arco Norte - Este" },   // Arco Norte section
];

export function useRiskZones(map: React.MutableRefObject<mapboxgl.Map | null>, mapLoaded: boolean) {
  // We need to track which zones have been added to prevent duplicates
  const zonesAdded = useRef<boolean>(false);
  
  const addRiskZones = useCallback(() => {
    if (!map.current || !mapLoaded || zonesAdded.current) return;
    
    try {
      // Add risk zones after map is fully loaded - reduced radius to approx 1km
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
        
        // Add layer for this risk zone - radius in meters (approximately 1km)
        map.current?.addLayer({
          id: id,
          type: 'circle',
          source: id,
          paint: {
            'circle-radius': zone.radius * 1000,
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
      
      zonesAdded.current = true;
    } catch (error) {
      console.error('Error adding risk zones:', error);
    }
  }, [map, mapLoaded]);

  return { addRiskZones };
}
