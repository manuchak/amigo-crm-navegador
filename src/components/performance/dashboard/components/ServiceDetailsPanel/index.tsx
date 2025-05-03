
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Package } from 'lucide-react';
import { ActiveService } from '../../types';
import { StatusOverview } from './StatusOverview';
import { RiskIndicators } from './RiskIndicators';
import { ServiceInfo } from './ServiceInfo';
import { CargoInfo } from './CargoInfo';
import { EmptyState } from './EmptyState';

interface ServiceDetailsPanelProps {
  selectedService?: ActiveService;
}

export function ServiceDetailsPanel({ selectedService }: ServiceDetailsPanelProps) {
  return (
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
            <StatusOverview service={selectedService} />
            
            {/* Risk indicators */}
            <RiskIndicators service={selectedService} />
            
            {/* Service info */}
            <ServiceInfo service={selectedService} />
            
            {/* Cargo info */}
            <CargoInfo service={selectedService} />
          </motion.div>
        ) : (
          <EmptyState />
        )}
      </CardContent>
    </Card>
  );
}
