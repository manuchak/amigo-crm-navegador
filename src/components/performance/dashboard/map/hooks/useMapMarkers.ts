
import { useCallback, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { ActiveService } from '../../types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { AlertTriangle, CloudRain, ArrowDown, Check, Clock } from 'lucide-react';

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
          'w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-lg transition-all duration-300 relative',
          selectedServiceId === service.id ? 'border-[3px] border-primary scale-110 z-50' : 'border border-gray-200'
        );
        
        // Determine which icon to show based on service status
        let icon;
        let iconColor;
        let iconBgColor;
        
        if (service.roadBlockage && service.roadBlockage.active) {
          icon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-down"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>`;
          iconColor = 'text-white';
          iconBgColor = 'bg-red-500';
        } else if (service.weatherEvent && service.weatherEvent.severity > 0) {
          icon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-cloud-rain"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M16 14v6"/><path d="M8 14v6"/><path d="M12 16v6"/></svg>`;
          iconColor = 'text-white';
          iconBgColor = 'bg-amber-500';
        } else if (service.inRiskZone) {
          icon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-alert-triangle"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>`;
          iconColor = 'text-white';
          iconBgColor = 'bg-red-500';
        } else if (service.delayRisk && service.delayRiskPercent > 50) {
          icon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-clock"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`;
          iconColor = 'text-white';
          iconBgColor = 'bg-amber-500';
        } else {
          icon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check"><polyline points="20 6 9 17 4 12"/></svg>`;
          iconColor = 'text-white';
          iconBgColor = 'bg-green-500';
        }
        
        // Add status indicator with icon
        const statusIndicator = document.createElement('div');
        statusIndicator.className = `w-8 h-8 rounded-full ${iconBgColor} flex items-center justify-center`;
        statusIndicator.innerHTML = icon;
        markerEl.appendChild(statusIndicator);
        
        // Add ID label
        const idLabel = document.createElement('div');
        idLabel.className = 'absolute -bottom-5 bg-white px-1.5 py-0.5 rounded text-xs font-medium shadow-sm';
        idLabel.textContent = service.id.replace('SVC-', '');
        markerEl.appendChild(idLabel);
        
        // Create popup for marker with more details
        const popupContent = `
          <div class="p-2">
            <div class="font-medium">${service.id}</div>
            <div class="text-sm text-muted-foreground">${service.custodioName}</div>
            <div class="text-xs mt-1">
              <span class="font-medium">ETA:</span> ${service.adjustedEta || service.eta}
            </div>
            ${service.roadBlockage && service.roadBlockage.active ? 
              `<div class="text-xs mt-1 text-red-600">
                <span class="font-medium">Bloqueo:</span> ${service.roadBlockage.location}
              </div>` : ''}
            ${service.weatherEvent && service.weatherEvent.severity > 0 ? 
              `<div class="text-xs mt-1 text-amber-600">
                <span class="font-medium">Clima:</span> ${service.weatherEvent.type}
              </div>` : ''}
          </div>
        `;
        
        // Create popup
        const popup = new mapboxgl.Popup({
          offset: 25,
          closeButton: false,
          closeOnClick: false,
          className: 'service-marker-popup'
        }).setHTML(popupContent);
        
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
