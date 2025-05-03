
import React, { useState, useMemo } from 'react';
import { ActiveServicesMap } from './ActiveServicesMap';
import { ActiveService } from './types';
import { mockActiveServices } from './mockActiveServices';
import { StatsCards, ServicesList, MapHeader, ServiceDetailsPanel } from './components';

export function ActiveServicesDashboard() {
  const [selectedServiceId, setSelectedServiceId] = useState<string | undefined>();
  const [showAllServices, setShowAllServices] = useState(false);
  
  // In a real application, you would fetch this data from the backend
  const services = useMemo(() => mockActiveServices, []);
  
  const selectedService = useMemo(() => {
    return services.find(s => s.id === selectedServiceId);
  }, [selectedServiceId, services]);
  
  // Stats for summary cards
  const stats = useMemo(() => {
    const totalServices = services.length;
    const delayedCount = services.filter(s => s.delayRisk && s.delayRiskPercent > 50).length;
    const riskZoneCount = services.filter(s => s.inRiskZone).length;
    
    return {
      total: totalServices,
      delayed: delayedCount,
      riskZone: riskZoneCount,
      onTime: totalServices - delayedCount - riskZoneCount,
    };
  }, [services]);
  
  // Display services - limit to 4 unless showAllServices is true
  const displayedServices = useMemo(() => {
    return showAllServices ? services : services.slice(0, 4);
  }, [services, showAllServices]);
  
  return (
    <div className="w-full h-full">
      <div className="grid grid-cols-1 lg:grid-cols-16 gap-4 h-full">
        {/* Left sidebar with active service cards */}
        <div className="lg:col-span-3 flex flex-col h-[calc(100vh-150px)]">
          <StatsCards 
            total={stats.total} 
            onTime={stats.onTime} 
            delayed={stats.delayed} 
            riskZone={stats.riskZone} 
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
        
        {/* Main area with map and details */}
        <div className="lg:col-span-13 flex flex-col h-[calc(100vh-150px)]">
          <MapHeader />
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-grow">
            {/* Map container */}
            <div className="lg:col-span-8 flex flex-col h-full">
              <ActiveServicesMap 
                services={services} 
                selectedServiceId={selectedServiceId} 
                onServiceSelect={setSelectedServiceId} 
              />
            </div>
            
            {/* Service details */}
            <div className="lg:col-span-4">
              <ServiceDetailsPanel selectedService={selectedService} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
