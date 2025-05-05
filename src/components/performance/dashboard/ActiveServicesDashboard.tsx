
import React, { useState, useMemo } from 'react';
import { ActiveServicesMap } from './map';
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
    <div className="h-[calc(100vh-160px)]">
      <div className="grid grid-cols-12 gap-2 h-full">
        {/* Left sidebar with active service cards - optimized width */}
        <div className="col-span-3 lg:col-span-2 flex flex-col h-full overflow-hidden">
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
        
        {/* Main area with map and details - expanded width */}
        <div className="col-span-9 lg:col-span-10 flex flex-col h-full overflow-hidden">
          <MapHeader />
          
          <div className="grid grid-cols-12 gap-2 flex-grow h-[calc(100%-50px)] overflow-hidden">
            {/* Map container - expanded width for better visualization */}
            <div className="col-span-9 h-full">
              <ActiveServicesMap 
                services={services} 
                selectedServiceId={selectedServiceId} 
                onServiceSelect={setSelectedServiceId} 
              />
            </div>
            
            {/* Service details - optimized width */}
            <div className="col-span-3 h-full overflow-hidden">
              <ServiceDetailsPanel selectedService={selectedService} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
