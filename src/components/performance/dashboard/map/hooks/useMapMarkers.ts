
import { useCallback, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { ActiveService } from '../../types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export function useMapMarkers(
  map: React.MutableRefObject<mapboxgl.Map | null>,
  mapLoaded: boolean,
  markersRef: React.MutableRefObject<{ [key: string]: mapboxgl.Marker }>,
  onServiceSelect: (id: string) => void,
  selectedServiceId?: string
) {
  const updateMarkers = useCallback((services: ActiveService[]) => {
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
      toast.error('Error al actualizar marcadores', {
        description: 'No se pudieron actualizar los marcadores del mapa.'
      });
    }
  }, [map, mapLoaded, markersRef, onServiceSelect, selectedServiceId]);
  
  return { updateMarkers };
}
