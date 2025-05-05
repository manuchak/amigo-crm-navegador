
import { useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import { ActiveService } from '../../types';

export function useRouteDisplay(
  map: React.MutableRefObject<mapboxgl.Map | null>,
  mapLoaded: boolean
) {
  const updateRouteDisplay = useCallback(async (services: ActiveService[], selectedServiceId?: string) => {
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
        
        // If origin and destination coordinates are available, fetch routing data
        if (service.originCoordinates && service.destinationCoordinates) {
          // Clear previous route if it exists
          if (map.current.getLayer('route')) {
            map.current.removeLayer('route');
          }
          if (map.current.getLayer('route-arrows')) {
            map.current.removeLayer('route-arrows');
          }
          if (map.current.getSource('route')) {
            map.current.removeSource('route');
          }
          
          // Use Mapbox Directions API to get the actual road-based route
          const originPoint = service.originCoordinates;
          const destinationPoint = service.destinationCoordinates;
          const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${originPoint[0]},${originPoint[1]};${destinationPoint[0]},${destinationPoint[1]}?steps=true&geometries=geojson&overview=full&access_token=${mapboxgl.accessToken}`;
          
          const response = await fetch(url);
          const data = await response.json();
          
          if (data.routes && data.routes.length > 0) {
            const route = data.routes[0];
            const routeGeometry = route.geometry;
            
            // Add the route source and layer
            map.current.addSource('route', {
              type: 'geojson',
              data: {
                type: 'Feature',
                properties: {},
                geometry: routeGeometry
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
            
            // Fit bounds to show the entire route with padding
            const bounds = new mapboxgl.LngLatBounds();
            routeGeometry.coordinates.forEach((coord: [number, number]) => bounds.extend(coord as mapboxgl.LngLatLike));
            map.current.fitBounds(bounds, { padding: 100, maxZoom: 13 });
          } else {
            console.warn('No route found in the response');
            // Fallback to drawing a line if the API doesn't return a route
            drawFallbackRoute(map.current, service);
          }
        } else if (service.routeCoordinates && service.routeCoordinates.length > 1) {
          // Fallback to using stored route coordinates if available
          drawFallbackRoute(map.current, service);
        }
      }
    } catch (error) {
      console.error('Error updating route:', error);
      // Attempt to draw fallback route if there's an error with the Directions API
      const service = services.find(s => s.id === selectedServiceId);
      if (service && map.current) {
        drawFallbackRoute(map.current, service);
      }
    }
  }, [map, mapLoaded]);
  
  // Helper function to draw a fallback route using just the coordinates we have
  const drawFallbackRoute = (mapInstance: mapboxgl.Map, service: ActiveService) => {
    // Use the stored route coordinates or create a simple route from origin to destination
    const routeCoords = service.routeCoordinates || [
      service.originCoordinates || [],
      service.currentLocation.coordinates,
      service.destinationCoordinates || []
    ].filter(coord => coord.length === 2);
    
    if (routeCoords.length < 2) return;
    
    // Remove existing route layers if they exist
    if (mapInstance.getLayer('route')) {
      mapInstance.removeLayer('route');
    }
    if (mapInstance.getLayer('route-arrows')) {
      mapInstance.removeLayer('route-arrows');
    }
    if (mapInstance.getSource('route')) {
      mapInstance.removeSource('route');
    }
    
    // Add the fallback route source
    mapInstance.addSource('route', {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: routeCoords
        }
      }
    });
    
    // Add fallback route line layer
    mapInstance.addLayer({
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
    mapInstance.addLayer({
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
    
    // Fit bounds to show the entire route
    const bounds = new mapboxgl.LngLatBounds();
    routeCoords.forEach(coord => bounds.extend(coord as mapboxgl.LngLatLike));
    mapInstance.fitBounds(bounds, { padding: 100, maxZoom: 13 });
  };
  
  return { updateRouteDisplay };
}
