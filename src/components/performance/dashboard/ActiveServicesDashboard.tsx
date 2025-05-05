
import React, { useState, useMemo } from 'react';
import { ActiveServicesMap } from './map';
import { ActiveService } from './types';
import { mockActiveServices } from './mockActiveServices';
import { StatsCards, ServicesList, MapHeader, ServiceDetailsPanel } from './components';
import { ServiceCard } from './ServiceCard';
import { TwitterFeed } from './components/TwitterFeed';
import { useTwitterFeed } from './hooks/useTwitterFeed';

export function ActiveServicesDashboard() {
  const [selectedServiceId, setSelectedServiceId] = useState<string | undefined>();
  const [showAllServices, setShowAllServices] = useState(false);
  
  // In a real application, you would fetch this data from the backend
  const services = useMemo(() => mockActiveServices, []);
  
  const selectedService = useMemo(() => {
    return services.find(s => s.id === selectedServiceId);
  }, [selectedServiceId, services]);
  
  // Stats for summary cards - ensure all values are positive
  const stats = useMemo(() => {
    const totalServices = services.length;
    const roadBlockCount = services.filter(s => s.roadBlockage && s.roadBlockage.active).length;
    const weatherEventCount = services.filter(s => s.weatherEvent && s.weatherEvent.severity > 0).length;
    const delayedCount = services.filter(s => s.delayRisk && s.delayRiskPercent > 50).length;
    const riskZoneCount = services.filter(s => s.inRiskZone).length;
    
    // Calculate onTime by subtracting all risky services from total, ensuring non-negative
    const riskyServicesCount = roadBlockCount + weatherEventCount + delayedCount + riskZoneCount;
    const onTime = Math.max(0, totalServices - riskyServicesCount);
    
    return {
      total: totalServices,
      roadBlocks: roadBlockCount,
      weatherEvents: weatherEventCount,
      delayed: delayedCount,
      riskZone: riskZoneCount,
      onTime: onTime,
    };
  }, [services]);
  
  // Display services - limit to 4 unless showAllServices is true
  const displayedServices = useMemo(() => {
    return showAllServices ? services : services.slice(0, 4);
  }, [services, showAllServices]);
  
  // Twitter feed for traffic and weather alerts
  const { tweets, isLoading, error, direction } = useTwitterFeed(30); // Reduced frequency of updates
  
  return (
    <div className="h-[calc(100vh-160px)]">
      {/* Twitter feed banner at the top for traffic and weather alerts */}
      <div className="mb-3">
        <TwitterFeed 
          tweets={tweets} 
          isLoading={isLoading} 
          error={error}
          direction={direction}
        />
      </div>
      
      <div className="grid grid-cols-12 gap-3 h-[calc(100%-40px)]">
        {/* Left sidebar with active service cards - optimized width */}
        <div className="col-span-3 lg:col-span-2 flex flex-col h-full overflow-hidden">
          <StatsCards 
            total={stats.total} 
            onTime={stats.onTime} 
            delayed={stats.delayed} 
            riskZone={stats.riskZone}
            roadBlocks={stats.roadBlocks}
            weatherEvents={stats.weatherEvents}
          />
          
          <ServicesList 
            services={services}
            displayedServices={displayedServices}
            selectedServiceId={selectedServiceId}
            setSelectedServiceId={setSelectedServiceId}
            showAllServices={showAllServices}
            setShowAllServices={setShowAllServices}
          />
        </div>
        
        {/* Main area with map and details - expanded width */}
        <div className="col-span-9 lg:col-span-10 flex flex-col h-full overflow-hidden">
          <MapHeader />
          
          <div className="grid grid-cols-12 gap-3 flex-grow h-[calc(100%-50px)] overflow-hidden">
            {/* Map container - expanded width for better visualization */}
            <div className="col-span-8 h-full">
              <ActiveServicesMap 
                services={services} 
                selectedServiceId={selectedServiceId} 
                onServiceSelect={setSelectedServiceId} 
              />
            </div>
            
            {/* Service details - optimized width */}
            <div className="col-span-4 h-full overflow-hidden">
              <div className="flex flex-col h-full gap-3">
                {/* High priority services (with risks) */}
                <div className="h-1/2 overflow-auto">
                  <div className="mb-2 px-1 flex items-center justify-between">
                    <h3 className="text-xs font-medium text-slate-500">Servicios en riesgo</h3>
                    <span className="text-xs text-slate-400">
                      {Math.min(stats.roadBlocks + stats.weatherEvents + stats.riskZone + stats.delayed, stats.total)} de {stats.total}
                    </span>
                  </div>
                  <div className="space-y-2 p-0.5 overflow-auto">
                    {services
                      .filter(service => 
                        (service.roadBlockage && service.roadBlockage.active) ||
                        (service.weatherEvent && service.weatherEvent.severity > 0) ||
                        service.inRiskZone || 
                        (service.delayRisk && service.delayRiskPercent > 50)
                      )
                      .slice(0, 3)
                      .map(service => (
                        <ServiceCard
                          key={service.id}
                          service={service}
                          isSelected={service.id === selectedServiceId}
                          onClick={() => setSelectedServiceId(service.id)}
                        />
                      ))}
                    {stats.roadBlocks + stats.weatherEvents + stats.riskZone + stats.delayed === 0 && (
                      <div className="flex items-center justify-center h-24 text-sm text-slate-400">
                        No hay servicios en riesgo
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Service details panel */}
                <div className="h-1/2 overflow-hidden">
                  <ServiceDetailsPanel selectedService={selectedService} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
