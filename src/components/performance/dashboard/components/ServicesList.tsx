
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ServiceCard } from '../ServiceCard';
import { ActiveService } from '../types';
import { Truck, ChevronDown, ChevronUp } from 'lucide-react';

interface ServicesListProps {
  services: ActiveService[];
  displayedServices: ActiveService[];
  selectedServiceId?: string;
  setSelectedServiceId: (id: string) => void;
  showAllServices: boolean;
  setShowAllServices: (show: boolean) => void;
}

export function ServicesList({
  services,
  displayedServices,
  selectedServiceId,
  setSelectedServiceId,
  showAllServices,
  setShowAllServices
}: ServicesListProps) {
  return (
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
  );
}
