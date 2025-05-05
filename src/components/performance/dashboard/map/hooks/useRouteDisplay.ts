
import { useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import { ActiveService } from '../../types';
import { toast } from 'sonner';

export function useRouteDisplay(
  map: React.MutableRefObject<mapboxgl.Map | null>,
  mapLoaded: boolean
) {
  const updateRouteDisplay = useCallback(
    (services: ActiveService[], selectedServiceId?: string) => {
      if (!map.current || !mapLoaded) return;

      try {
        // Remove existing route layers and sources
        if (map.current.getSource('route')) {
          map.current.removeLayer('route-line');
          map.current.removeLayer('route-casing');
          
          // Remove incident markers if they exist
          if (map.current.getLayer('weather-incidents')) {
            map.current.removeLayer('weather-incidents');
            map.current.removeLayer('weather-symbols');
          }
          if (map.current.getLayer('road-blocks')) {
            map.current.removeLayer('road-blocks');
            map.current.removeLayer('roadblock-symbols');
          }
          
          map.current.removeSource('route');
          map.current.removeSource('incidents');
        }

        // If no service is selected, don't add any route
        if (!selectedServiceId) return;

        // Find the selected service
        const selectedService = services.find((s) => s.id === selectedServiceId);
        if (!selectedService) return;

        // Determine if service is on time
        const isOnTime = selectedService.isOnTime !== undefined 
          ? selectedService.isOnTime 
          : (selectedService.status !== 'delayed' && !(selectedService.delayRisk && selectedService.delayRiskPercent > 50));

        // Create route data
        const routeData = {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: [
              selectedService.originCoordinates,
              selectedService.currentLocation.coordinates,
              selectedService.destinationCoordinates,
            ],
          },
        };

        // Add the route source
        map.current.addSource('route', {
          type: 'geojson',
          data: routeData as any,
        });

        // Add route line casing (wider line underneath for border effect)
        map.current.addLayer({
          id: 'route-casing',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': '#ffffff',
            'line-width': 6,
            'line-opacity': 0.9,
          },
        });

        // Determine line color based on risk factors
        let lineColor = '#34d399'; // Green for on-time
        
        // Route color represents the primary risk factor, not necessarily if it's delayed
        if (selectedService.roadBlockage && selectedService.roadBlockage.active) {
          lineColor = selectedService.roadBlockage.causesDelay ? '#ef4444' : '#f97316'; // Red for blockages causing delay, orange otherwise
        } else if (selectedService.weatherEvent && selectedService.weatherEvent.severity > 0) {
          lineColor = selectedService.weatherEvent.causesDelay ? '#f59e0b' : '#fbbf24'; // Amber for weather causing delay, yellow otherwise
        } else if (selectedService.inRiskZone) {
          lineColor = '#ef4444'; // Red for risk zone
        } else if (!isOnTime) {
          lineColor = '#f59e0b'; // Amber for general delay without specific risk factor
        }

        // Add the main route line
        map.current.addLayer({
          id: 'route-line',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': lineColor,
            'line-width': 4,
            'line-dasharray': isOnTime ? [0, 0, 0] : [0, 2, 4], // Create a dashed line effect for delayed services
          },
        });

        // Create incidents on the route if they exist
        const incidents = [];
        
        // Add weather incident if it exists
        if (selectedService.weatherEvent && selectedService.weatherEvent.severity > 0) {
          // Position the weather incident halfway between origin and current location
          // or at the exact coordinates if available in the future
          const weatherIncidentPos = [
            (selectedService.originCoordinates[0] + selectedService.currentLocation.coordinates[0]) / 2,
            (selectedService.originCoordinates[1] + selectedService.currentLocation.coordinates[1]) / 2,
          ];
          
          incidents.push({
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: weatherIncidentPos,
            },
            properties: {
              type: 'weather',
              severity: selectedService.weatherEvent.severity,
              description: selectedService.weatherEvent.type,
              location: selectedService.weatherEvent.location,
              causesDelay: selectedService.weatherEvent.causesDelay || false
            },
          });
        }
        
        // Add road blockage if it exists
        if (selectedService.roadBlockage && selectedService.roadBlockage.active) {
          // Position the road blockage incident halfway between current location and destination
          // or at the exact coordinates if available in the future
          const blockagePos = [
            (selectedService.currentLocation.coordinates[0] + selectedService.destinationCoordinates[0]) / 2,
            (selectedService.currentLocation.coordinates[1] + selectedService.destinationCoordinates[1]) / 2,
          ];
          
          incidents.push({
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: blockagePos,
            },
            properties: {
              type: 'roadblock',
              description: selectedService.roadBlockage.reason,
              location: selectedService.roadBlockage.location,
              causesDelay: selectedService.roadBlockage.causesDelay || false
            },
          });
        }
        
        // If we have any incidents, add them to the map
        if (incidents.length > 0) {
          // Add the incidents source
          map.current.addSource('incidents', {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: incidents,
            },
          });
          
          // Add weather incidents layer with color based on whether it causes delay
          if (incidents.some(i => i.properties.type === 'weather')) {
            map.current.addLayer({
              id: 'weather-incidents',
              type: 'circle',
              source: 'incidents',
              filter: ['==', 'type', 'weather'],
              paint: {
                'circle-radius': 18,
                'circle-color': [
                  'case',
                  ['==', ['get', 'causesDelay'], true], '#f59e0b', // Amber if causing delay
                  '#fbbf24' // Yellow if not causing delay
                ],
                'circle-opacity': 0.8,
                'circle-stroke-width': 2,
                'circle-stroke-color': '#ffffff',
              },
            });
            
            // Add a cloud icon
            map.current.addLayer({
              id: 'weather-symbols',
              type: 'symbol',
              source: 'incidents',
              filter: ['==', 'type', 'weather'],
              layout: {
                'text-field': '☁️',
                'text-size': 16,
                'text-allow-overlap': true,
              },
            });
          }
          
          // Add road blockage layer with color based on whether it causes delay
          if (incidents.some(i => i.properties.type === 'roadblock')) {
            map.current.addLayer({
              id: 'road-blocks',
              type: 'circle',
              source: 'incidents',
              filter: ['==', 'type', 'roadblock'],
              paint: {
                'circle-radius': 18,
                'circle-color': [
                  'case',
                  ['==', ['get', 'causesDelay'], true], '#ef4444', // Red if causing delay
                  '#f97316' // Orange if not causing delay
                ],
                'circle-opacity': 0.8,
                'circle-stroke-width': 2,
                'circle-stroke-color': '#ffffff',
              },
            });
            
            // Add an X icon for blockages
            map.current.addLayer({
              id: 'roadblock-symbols',
              type: 'symbol',
              source: 'incidents',
              filter: ['==', 'type', 'roadblock'],
              layout: {
                'text-field': '❌',
                'text-size': 14,
                'text-allow-overlap': true,
              },
            });
          }
        }

        // Fly to the route with some padding
        const coordinates = [
          selectedService.originCoordinates,
          selectedService.currentLocation.coordinates,
          selectedService.destinationCoordinates,
        ];

        const bounds = new mapboxgl.LngLatBounds();
        coordinates.forEach((coord) => bounds.extend(coord as mapboxgl.LngLatLike));

        map.current.fitBounds(bounds, {
          padding: { top: 50, bottom: 50, left: 50, right: 50 },
          maxZoom: 10,
        });
      } catch (error) {
        console.error('Error displaying route:', error);
        toast.error('Error al mostrar ruta', {
          description: 'No se pudo visualizar la ruta seleccionada.',
        });
      }
    },
    [map, mapLoaded]
  );

  return { updateRouteDisplay };
}
