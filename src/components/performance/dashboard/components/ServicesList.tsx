
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
    <Card className="flex-grow shadow-sm border overflow-hidden">
      <CardHeader className="py-2 px-3 border-b bg-slate-50/80">
        <CardTitle className="text-sm flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <div className="bg-primary/10 p-1 rounded">
              <Truck className="w-3.5 h-3.5 text-primary" />
            </div>
            Servicios Activos
          </span>
          <Badge variant="secondary" className="bg-slate-100 text-xs font-medium">{services.length}</Badge>
        </CardTitle>
      </CardHeader>
      <ScrollArea className="h-[calc(100vh-220px)]">
        <CardContent className="p-2">
          <div className="space-y-2">
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
              className="w-full mt-2 text-xs text-muted-foreground flex items-center justify-center gap-1 h-8"
              onClick={() => setShowAllServices(!showAllServices)}
            >
              {showAllServices ? (
                <>
                  Mostrar menos <ChevronUp className="h-3 w-3" />
                </>
              ) : (
                <>
                  Mostrar todos ({services.length}) <ChevronDown className="h-3 w-3" />
                </>
              )}
            </Button>
          )}
        </CardContent>
      </ScrollArea>
    </Card>
  );
}
