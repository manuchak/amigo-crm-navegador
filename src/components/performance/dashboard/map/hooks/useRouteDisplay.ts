
import { useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import { ActiveService } from '../../types';

export function useRouteDisplay(
  map: React.MutableRefObject<mapboxgl.Map | null>,
  mapLoaded: boolean
) {
  const updateRouteDisplay = useCallback((services: ActiveService[], selectedServiceId?: string) => {
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
  }, [map, mapLoaded]);
  
  return { updateRouteDisplay };
}
