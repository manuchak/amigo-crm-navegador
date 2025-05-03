
import React, { useState, useMemo } from 'react';
import { ActiveServicesMap } from './ActiveServicesMap';
import { ServiceCard } from './ServiceCard';
import { ActiveService } from './types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, AlertCircle, Package, MapPin, Timer, Truck, Route } from 'lucide-react';
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
            <Card className="bg-white shadow-sm hover:shadow transition-shadow duration-300 border border-slate-100">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center w-10 h-10 mx-auto rounded-full bg-green-50 mb-2">
                  <Clock className="h-5 w-5 text-green-500" />
                </div>
                <p className="text-sm text-muted-foreground mb-1">En tiempo</p>
                <p className="text-xl font-semibold">{stats.onTime}</p>
              </CardContent>
            </Card>
            <Card className="bg-white shadow-sm hover:shadow transition-shadow duration-300 border border-slate-100">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center w-10 h-10 mx-auto rounded-full bg-amber-50 mb-2">
                  <Timer className="h-5 w-5 text-amber-500" />
                </div>
                <p className="text-sm text-muted-foreground mb-1">Con retraso</p>
                <p className="text-xl font-semibold">{stats.delayed}</p>
              </CardContent>
            </Card>
            <Card className="bg-white shadow-sm hover:shadow transition-shadow duration-300 border border-slate-100">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center w-10 h-10 mx-auto rounded-full bg-red-50 mb-2">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                </div>
                <p className="text-sm text-muted-foreground mb-1">Zona riesgo</p>
                <p className="text-xl font-semibold">{stats.riskZone}</p>
              </CardContent>
            </Card>
          </div>
          
          <Card className="flex-grow shadow-sm border border-slate-100">
            <CardHeader className="py-3 px-4 border-b border-slate-100">
              <CardTitle className="text-base flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Truck className="w-4 h-4" />
                  Servicios Activos
                </span>
                <Badge variant="outline" className="bg-slate-50">{services.length}</Badge>
              </CardTitle>
            </CardHeader>
            <ScrollArea className="h-[calc(100vh-280px)]">
              <CardContent className="p-3">
                <div className="space-y-2">
                  {services.map(service => (
                    <ServiceCard
                      key={service.id}
                      service={service}
                      isSelected={service.id === selectedServiceId}
                      onClick={() => setSelectedServiceId(service.id)}
                    />
                  ))}
                </div>
              </CardContent>
            </ScrollArea>
          </Card>
        </div>
        
        {/* Main area with map and details */}
        <div className="lg:col-span-9 flex flex-col h-[calc(100vh-180px)]">
          <Card className="mb-4 shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10">
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
                <h2 className="text-lg font-semibold">Monitoreo en Vivo</h2>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-white">
                  <Clock className="w-3 h-3 mr-1" />
                  Actualizado: {new Date().toLocaleTimeString()}
                </Badge>
              </div>
            </div>
          </Card>
          
          <div className="grid grid-cols-1 lg:grid-cols-8 gap-4 flex-grow">
            {/* Map container */}
            <div className="lg:col-span-5 flex flex-col h-full">
              <ActiveServicesMap 
                services={services} 
                selectedServiceId={selectedServiceId} 
                onServiceSelect={setSelectedServiceId} 
              />
            </div>
            
            {/* Service details */}
            <Card className="lg:col-span-3 h-full shadow-sm border border-slate-100 bg-white">
              <CardHeader className="py-3 px-4 border-b border-slate-100">
                <CardTitle className="text-base flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  {selectedService ? `Detalles del Servicio #${selectedService.id}` : 'Seleccione un servicio'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {selectedService ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="p-4"
                  >
                    {/* Service status overview */}
                    <div className="rounded-lg bg-slate-50 p-4 mb-4 border border-slate-100">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Estado</p>
                          <div className="flex items-center gap-2 mt-1">
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
                        <div className="bg-white p-2 rounded-md shadow-sm">
                          <p className="text-xs text-muted-foreground">ETA Original</p>
                          <p className="font-semibold mt-1 flex items-center">
                            <Clock className="h-3 w-3 mr-1 text-slate-400" />
                            {selectedService.etaOriginal}
                          </p>
                        </div>
                        <div className="bg-white p-2 rounded-md shadow-sm">
                          <p className="text-xs text-muted-foreground">ETA Actual</p>
                          <p className={cn(
                            "font-semibold mt-1 flex items-center",
                            selectedService.delayRisk && selectedService.delayRiskPercent > 50 ? "text-amber-600" : ""
                          )}>
                            <Clock className="h-3 w-3 mr-1 text-slate-400" />
                            {selectedService.eta}
                          </p>
                        </div>
                      </div>
                      
                      {/* Risk indicators */}
                      {(selectedService.delayRisk || selectedService.inRiskZone) && (
                        <div className="mt-4 bg-white p-3 rounded-md shadow-sm">
                          {selectedService.delayRisk && (
                            <div className="flex items-center gap-2 mb-2">
                              <Timer className="h-4 w-4 text-amber-600" />
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
                    </div>
                    
                    {/* Service info */}
                    <div className="bg-white rounded-lg border border-slate-100 p-4 mb-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center">
                          <Truck className="h-3 w-3 text-blue-500" />
                        </div>
                        <h3 className="font-medium text-sm">Información del Servicio</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                        <div className="bg-slate-50 p-2 rounded-md">
                          <p className="text-xs text-muted-foreground">Custodio</p>
                          <p className="mt-1">{selectedService.custodioName}</p>
                        </div>
                        <div className="bg-slate-50 p-2 rounded-md">
                          <p className="text-xs text-muted-foreground">ID Rastreo</p>
                          <p className="mt-1">#{selectedService.trackingId}</p>
                        </div>
                        <div className="col-span-2 bg-slate-50 p-2 rounded-md">
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> Origen
                          </p>
                          <p className="mt-1">{selectedService.origin}</p>
                        </div>
                        <div className="col-span-2 bg-slate-50 p-2 rounded-md">
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> Destino
                          </p>
                          <p className="mt-1">{selectedService.destination}</p>
                        </div>
                        <div className="col-span-2 bg-slate-50 p-2 rounded-md">
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Route className="h-3 w-3" /> Ubicación Actual
                          </p>
                          <p className="mt-1">{selectedService.currentLocation.address}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Cargo info */}
                    <div className="bg-white rounded-lg border border-slate-100 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-full bg-green-50 flex items-center justify-center">
                          <Package className="h-3 w-3 text-green-500" />
                        </div>
                        <h3 className="font-medium text-sm">Información de Carga</h3>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-md space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm flex items-center gap-1">
                            <Package className="h-4 w-4 text-slate-400" />
                            <span>Cantidad</span>
                          </span>
                          <span className="font-medium">{selectedService.cargo.count} {selectedService.cargo.type}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Peso total:</span>
                          <span className="font-medium">{selectedService.cargo.weight} kg</span>
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
