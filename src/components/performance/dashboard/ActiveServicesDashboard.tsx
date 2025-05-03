import React, { useState, useMemo } from 'react';
import { ActiveServicesMap } from './ActiveServicesMap';
import { ServiceCard } from './ServiceCard';
import { ActiveService } from './types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, AlertCircle, Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion } from 'framer-motion';
import { mockActiveServices } from './mockActiveServices';
import { cn } from '@/lib/utils';

export function ActiveServicesDashboard() {
  const [selectedServiceId, setSelectedServiceId] = useState<string | undefined>();
  
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
  
  return (
    <div className="w-full h-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
        {/* Left sidebar with active service cards */}
        <div className="lg:col-span-3 flex flex-col h-[calc(100vh-180px)]">
          <div className="grid grid-cols-3 gap-3 mb-4">
            <Card>
              <CardContent className="p-3 text-center">
                <Clock className="h-5 w-5 mx-auto text-green-600 mb-1" />
                <p className="text-xs text-muted-foreground">En tiempo</p>
                <p className="text-xl font-semibold">{stats.onTime}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <Clock className="h-5 w-5 mx-auto text-amber-600 mb-1" />
                <p className="text-xs text-muted-foreground">Con retraso</p>
                <p className="text-xl font-semibold">{stats.delayed}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <AlertCircle className="h-5 w-5 mx-auto text-red-600 mb-1" />
                <p className="text-xs text-muted-foreground">Zona riesgo</p>
                <p className="text-xl font-semibold">{stats.riskZone}</p>
              </CardContent>
            </Card>
          </div>
          
          <Card className="flex-grow">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-base flex items-center justify-between">
                <span>Servicios Activos</span>
                <Badge variant="outline">{services.length}</Badge>
              </CardTitle>
            </CardHeader>
            <ScrollArea className="h-[calc(100vh-280px)]">
              <CardContent className="p-3">
                {services.map(service => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    isSelected={service.id === selectedServiceId}
                    onClick={() => setSelectedServiceId(service.id)}
                  />
                ))}
              </CardContent>
            </ScrollArea>
          </Card>
        </div>
        
        {/* Main area with map and details */}
        <div className="lg:col-span-9 flex flex-col h-[calc(100vh-180px)]">
          <div className="bg-white rounded-xl shadow-sm border p-4 mb-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Monitoreo en Vivo</h2>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-white">
                  Actualizado: {new Date().toLocaleTimeString()}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-8 gap-4 flex-grow">
            {/* Map container */}
            <Card className="lg:col-span-5 flex flex-col h-full">
              <CardContent className="p-0 flex-grow relative">
                <ActiveServicesMap 
                  services={services} 
                  selectedServiceId={selectedServiceId} 
                  onServiceSelect={setSelectedServiceId} 
                />
              </CardContent>
            </Card>
            
            {/* Service details */}
            <Card className="lg:col-span-3 h-full">
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-base">
                  {selectedService ? `Detalles del Servicio #${selectedService.id}` : 'Seleccione un servicio'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {selectedService ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    {/* Service status overview */}
                    <Card className="border border-dashed">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Estado</p>
                            <div className="flex items-center gap-2">
                              <div className={cn(
                                "w-3 h-3 rounded-full",
                                selectedService.inRiskZone ? "bg-red-500" : 
                                selectedService.delayRisk && selectedService.delayRiskPercent > 50 ? "bg-amber-500" : 
                                "bg-green-500"
                              )} />
                              <span className="font-medium">
                                {selectedService.inRiskZone ? "Zona de riesgo" : 
                                 selectedService.delayRisk && selectedService.delayRiskPercent > 50 ? "Posible retraso" : 
                                 "En tiempo"}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {/* ETA information */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground">ETA Original</p>
                            <p className="font-semibold">{selectedService.etaOriginal}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">ETA Actual</p>
                            <p className={cn(
                              "font-semibold",
                              selectedService.delayRisk && selectedService.delayRiskPercent > 50 ? "text-amber-600" : ""
                            )}>
                              {selectedService.eta}
                            </p>
                          </div>
                        </div>
                        
                        {/* Risk indicators */}
                        {(selectedService.delayRisk || selectedService.inRiskZone) && (
                          <div className="mt-4">
                            {selectedService.delayRisk && (
                              <div className="flex items-center gap-2 mb-2">
                                <Clock className="h-4 w-4 text-amber-600" />
                                <span className="text-sm">
                                  {selectedService.delayRiskPercent}% probabilidad de retraso
                                </span>
                              </div>
                            )}
                            {selectedService.inRiskZone && (
                              <div className="flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 text-red-600" />
                                <span className="text-sm">En zona de alto riesgo</span>
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                    
                    {/* Service info */}
                    <div className="space-y-3">
                      <h3 className="font-medium text-sm">Información del Servicio</h3>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                        <div>
                          <p className="text-muted-foreground">Custodio</p>
                          <p>{selectedService.custodioName}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">ID Rastreo</p>
                          <p>#{selectedService.trackingId}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-muted-foreground">Origen</p>
                          <p>{selectedService.origin}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-muted-foreground">Destino</p>
                          <p>{selectedService.destination}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-muted-foreground">Ubicación Actual</p>
                          <p>{selectedService.currentLocation.address}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Cargo info */}
                    <div className="space-y-3">
                      <h3 className="font-medium text-sm">Información de Carga</h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-gray-500" />
                          <span>{selectedService.cargo.count} {selectedService.cargo.type}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Peso total:</span>
                          <span>{selectedService.cargo.weight} kg</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="h-full flex items-center justify-center text-center p-6">
                    <div className="text-muted-foreground">
                      <Package className="h-12 w-12 mx-auto mb-4 opacity-20" />
                      <p>Seleccione un servicio activo del mapa o de la lista para ver sus detalles</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper for className conditionals moved to lib/utils.ts
