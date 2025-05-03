
import React, { useState, useMemo } from 'react';
import { ActiveServicesMap } from './ActiveServicesMap';
import { ServiceCard } from './ServiceCard';
import { ActiveService } from './types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, AlertCircle, Package, MapPin, Timer, Truck, Route, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion } from 'framer-motion';
import { mockActiveServices } from './mockActiveServices';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
        {/* Left sidebar with active service cards */}
        <div className="lg:col-span-3 flex flex-col h-[calc(100vh-180px)]">
          <div className="grid grid-cols-3 gap-3 mb-4">
            <Card className="bg-white shadow-md hover:shadow-lg transition-all duration-300 border-0">
              <CardContent className="p-4 text-center flex flex-col items-center">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-50 mb-3">
                  <Clock className="h-5 w-5 text-green-500" />
                </div>
                <p className="text-sm text-muted-foreground mb-0.5">En tiempo</p>
                <p className="text-2xl font-bold text-green-600">{stats.onTime}</p>
              </CardContent>
            </Card>
            <Card className="bg-white shadow-md hover:shadow-lg transition-all duration-300 border-0">
              <CardContent className="p-4 text-center flex flex-col items-center">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-amber-50 mb-3">
                  <Timer className="h-5 w-5 text-amber-500" />
                </div>
                <p className="text-sm text-muted-foreground mb-0.5">Con retraso</p>
                <p className="text-2xl font-bold text-amber-600">{stats.delayed}</p>
              </CardContent>
            </Card>
            <Card className="bg-white shadow-md hover:shadow-lg transition-all duration-300 border-0">
              <CardContent className="p-4 text-center flex flex-col items-center">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-50 mb-3">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                </div>
                <p className="text-sm text-muted-foreground mb-0.5">Zona riesgo</p>
                <p className="text-2xl font-bold text-red-600">{stats.riskZone}</p>
              </CardContent>
            </Card>
          </div>
          
          <Card className="flex-grow shadow-md border-0 bg-white overflow-hidden">
            <CardHeader className="py-4 px-5 border-b bg-slate-50/80">
              <CardTitle className="text-base flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <div className="bg-primary/10 p-1.5 rounded">
                    <Truck className="w-4 h-4 text-primary" />
                  </div>
                  Servicios Activos
                </span>
                <Badge variant="secondary" className="bg-slate-100 font-medium">{services.length}</Badge>
              </CardTitle>
            </CardHeader>
            <ScrollArea className="h-[calc(100vh-280px)]">
              <CardContent className="p-4">
                <div className="space-y-3">
                  {displayedServices.map(service => (
                    <ServiceCard
                      key={service.id}
                      service={service}
                      isSelected={service.id === selectedServiceId}
                      onClick={() => setSelectedServiceId(service.id)}
                    />
                  ))}
                </div>
                
                {services.length > 4 && (
                  <Button 
                    variant="ghost" 
                    className="w-full mt-4 text-sm text-muted-foreground flex items-center justify-center gap-1"
                    onClick={() => setShowAllServices(!showAllServices)}
                  >
                    {showAllServices ? (
                      <>
                        Mostrar menos <ChevronUp className="h-4 w-4" />
                      </>
                    ) : (
                      <>
                        Mostrar todos ({services.length}) <ChevronDown className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </ScrollArea>
          </Card>
        </div>
        
        {/* Main area with map and details */}
        <div className="lg:col-span-9 flex flex-col h-[calc(100vh-180px)]">
          <Card className="mb-4 shadow-md border-0 bg-white overflow-hidden">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Monitoreo en Vivo</h2>
                  <p className="text-xs text-muted-foreground">Visualización de servicios en ruta</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="bg-white flex items-center gap-1.5 px-2.5 py-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  {new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
                </Badge>
                <Badge variant="outline" className="bg-white flex items-center gap-1.5 px-2.5 py-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  {new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                </Badge>
              </div>
            </div>
          </Card>
          
          <div className="grid grid-cols-1 lg:grid-cols-8 gap-5 flex-grow">
            {/* Map container */}
            <div className="lg:col-span-5 flex flex-col h-full">
              <ActiveServicesMap 
                services={services} 
                selectedServiceId={selectedServiceId} 
                onServiceSelect={setSelectedServiceId} 
              />
            </div>
            
            {/* Service details */}
            <Card className="lg:col-span-3 h-full shadow-md border-0 bg-white overflow-hidden">
              <CardHeader className="py-4 px-5 border-b bg-slate-50/80">
                <CardTitle className="text-base flex items-center gap-2">
                  <div className="bg-primary/10 p-1.5 rounded">
                    <Package className="w-4 h-4 text-primary" />
                  </div>
                  {selectedService ? `Detalle del Servicio #${selectedService.id}` : 'Seleccione un servicio'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {selectedService ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="p-5"
                  >
                    {/* Service status overview */}
                    <div className="rounded-xl bg-slate-50/70 p-4 mb-5 border border-slate-100">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-sm text-slate-500 mb-1">Estado del servicio</p>
                          <div className="flex items-center gap-2">
                            <div className={cn(
                              "w-3 h-3 rounded-full",
                              selectedService.inRiskZone ? "bg-red-500" : 
                              selectedService.delayRisk && selectedService.delayRiskPercent > 50 ? "bg-amber-500" : 
                              "bg-green-500"
                            )} />
                            <span className="font-semibold">
                              {selectedService.inRiskZone ? "Zona de riesgo" : 
                               selectedService.delayRisk && selectedService.delayRiskPercent > 50 ? "Posible retraso" : 
                               "En tiempo"}
                            </span>
                          </div>
                        </div>
                        <Badge 
                          className={cn(
                            "uppercase text-xs font-bold",
                            selectedService.inRiskZone ? "bg-red-500" :
                            selectedService.delayRisk && selectedService.delayRiskPercent > 50 ? "bg-amber-500" :
                            "bg-green-500"
                          )}
                        >
                          {selectedService.status === 'delayed' ? 'Con retraso' : 
                           selectedService.status === 'completed' ? 'Completado' : 
                           'En tránsito'}
                        </Badge>
                      </div>
                      
                      {/* ETA information */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-3 rounded-lg shadow-sm">
                          <p className="text-xs text-slate-500">ETA Original</p>
                          <p className="font-bold mt-1 flex items-center">
                            <Clock className="h-3.5 w-3.5 mr-1.5 text-slate-400" />
                            {selectedService.etaOriginal}
                          </p>
                        </div>
                        <div className="bg-white p-3 rounded-lg shadow-sm">
                          <p className="text-xs text-slate-500">ETA Actual</p>
                          <p className={cn(
                            "font-bold mt-1 flex items-center",
                            selectedService.delayRisk && selectedService.delayRiskPercent > 50 ? "text-amber-600" : ""
                          )}>
                            <Clock className="h-3.5 w-3.5 mr-1.5 text-slate-400" />
                            {selectedService.eta}
                          </p>
                        </div>
                      </div>
                      
                      {/* Risk indicators */}
                      {(selectedService.delayRisk || selectedService.inRiskZone) && (
                        <div className="mt-4 bg-white p-3 rounded-lg shadow-sm">
                          {selectedService.delayRisk && (
                            <div className="flex items-center gap-2 mb-2">
                              <Timer className="h-4 w-4 text-amber-500" />
                              <span className="text-sm font-medium">
                                {selectedService.delayRiskPercent}% probabilidad de retraso
                              </span>
                            </div>
                          )}
                          {selectedService.inRiskZone && (
                            <div className="flex items-center gap-2">
                              <AlertCircle className="h-4 w-4 text-red-500" />
                              <span className="text-sm font-medium">En zona de alto riesgo</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Service info */}
                    <div className="bg-white rounded-xl border border-slate-100 p-4 mb-5 shadow-sm">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                          <Truck className="h-4 w-4 text-blue-500" />
                        </div>
                        <h3 className="font-semibold">Información del Servicio</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="bg-slate-50 p-3 rounded-lg">
                          <p className="text-xs text-slate-500">Custodio</p>
                          <p className="mt-1 font-medium">{selectedService.custodioName}</p>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-lg">
                          <p className="text-xs text-slate-500">ID Rastreo</p>
                          <p className="mt-1 font-medium">#{selectedService.trackingId}</p>
                        </div>
                        <div className="col-span-2 bg-slate-50 p-3 rounded-lg">
                          <p className="text-xs text-slate-500 flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> Origen
                          </p>
                          <p className="mt-1 font-medium">{selectedService.origin}</p>
                        </div>
                        <div className="col-span-2 bg-slate-50 p-3 rounded-lg">
                          <p className="text-xs text-slate-500 flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> Destino
                          </p>
                          <p className="mt-1 font-medium">{selectedService.destination}</p>
                        </div>
                        <div className="col-span-2 bg-slate-50 p-3 rounded-lg">
                          <p className="text-xs text-slate-500 flex items-center gap-1">
                            <Route className="h-3 w-3" /> Ubicación Actual
                          </p>
                          <p className="mt-1 font-medium">{selectedService.currentLocation.address}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Cargo info */}
                    <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center">
                          <Package className="h-4 w-4 text-green-500" />
                        </div>
                        <h3 className="font-semibold">Información de Carga</h3>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-lg space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm flex items-center gap-1.5">
                            <Package className="h-4 w-4 text-slate-500" />
                            <span>Cantidad</span>
                          </span>
                          <span className="font-semibold">{selectedService.cargo.count} {selectedService.cargo.type}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-500">Peso total:</span>
                          <span className="font-semibold">{selectedService.cargo.weight} kg</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="h-full flex items-center justify-center text-center p-8">
                    <div className="max-w-sm">
                      <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground/20" />
                      <p className="text-lg font-medium text-slate-700 mb-2">No hay detalles disponibles</p>
                      <p className="text-sm text-slate-500">
                        Seleccione un servicio activo del mapa o de la lista para ver sus detalles
                      </p>
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
