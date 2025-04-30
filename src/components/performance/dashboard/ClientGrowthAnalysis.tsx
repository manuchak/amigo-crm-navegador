
import React, { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronDown, ChevronUp, ArrowUp, ArrowDown, TrendingUp, TrendingDown } from "lucide-react";
import { formatCurrency, formatNumber, formatPercentage } from '../utils/formatters';
import { parseCurrencyValue } from '../services/servicios/utils';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface ClientGrowthData {
  nombre_cliente: string;
  totalServicios: {
    current: number;
    previous: number;
    change: number;
    percentChange: number;
  };
  gmv: {
    current: number;
    previous: number;
    change: number;
    percentChange: number;
  };
}

interface ClientGrowthAnalysisProps {
  serviciosData: any[];
  isLoading: boolean;
  dateRange: any;
  comparisonDateRange?: any;
}

export function ClientGrowthAnalysis({ 
  serviciosData = [], 
  isLoading,
  dateRange,
  comparisonDateRange
}: ClientGrowthAnalysisProps) {
  const [expandedGrowth, setExpandedGrowth] = useState(false);
  const [expandedDecline, setExpandedDecline] = useState(false);
  const [sortMetric, setSortMetric] = useState<'services' | 'gmv'>('services');
  const [dataCheckComplete, setDataCheckComplete] = useState(false);

  // Run initial diagnostic check on the data
  useEffect(() => {
    if (serviciosData && serviciosData.length > 0) {
      // Count how many services have non-zero cobro_cliente values
      const servicesWithGmv = serviciosData.filter(service => {
        const gmvValue = parseCurrencyValue(service.cobro_cliente);
        return gmvValue > 0;
      }).length;

      const totalGmv = serviciosData.reduce((sum, service) => {
        return sum + parseCurrencyValue(service.cobro_cliente);
      }, 0);

      console.log(`GMV Data Check: ${servicesWithGmv} out of ${serviciosData.length} services have GMV data`);
      console.log(`Total GMV value in data: ${totalGmv}`);

      if (servicesWithGmv === 0) {
        toast.warning('No hay datos de GMV disponibles', {
          description: 'Los valores de "cobro_cliente" no están disponibles o no son válidos'
        });
      } else if (servicesWithGmv < serviciosData.length * 0.1) {
        // Less than 10% of services have GMV data
        toast.info('Datos de GMV limitados', {
          description: `Solo ${servicesWithGmv} de ${serviciosData.length} servicios tienen datos de GMV`
        });
      }
      
      setDataCheckComplete(true);
    }
  }, [serviciosData]);

  // Process data to calculate growth/decline by client
  const clientGrowthData = useMemo(() => {
    if (!serviciosData || serviciosData.length === 0) return [];
    
    // Create a date threshold for comparison
    // If we have an explicit comparison date range, use it
    // Otherwise, split the current date range in half for comparison
    const currentStart = new Date(dateRange?.from);
    const currentEnd = new Date(dateRange?.to);
    let previousStart, previousEnd;
    
    if (comparisonDateRange && comparisonDateRange.from && comparisonDateRange.to) {
      previousStart = new Date(comparisonDateRange.from);
      previousEnd = new Date(comparisonDateRange.to);
    } else {
      // If no comparison range, split the current period in half
      const totalDays = Math.round((currentEnd.getTime() - currentStart.getTime()) / (1000 * 60 * 60 * 24));
      const halfPoint = new Date(currentStart.getTime() + (totalDays / 2) * 24 * 60 * 60 * 1000);
      
      previousStart = new Date(currentStart);
      previousEnd = new Date(halfPoint);
      currentStart.setTime(halfPoint.getTime() + 24 * 60 * 60 * 1000); // Start from day after half point
    }
    
    console.log("Date ranges for growth analysis:", {
      current: { from: currentStart.toISOString(), to: currentEnd.toISOString() },
      previous: { from: previousStart.toISOString(), to: previousEnd.toISOString() }
    });
    
    // Group services by client and period
    const clientData: Record<string, {
      currentServices: number;
      previousServices: number;
      currentGMV: number;
      previousGMV: number;
      serviciosIds: Set<string>;
      previousServiciosIds: Set<string>;
      rawCurrentGmvValues: number[];  // Store raw values for debugging
      rawPreviousGmvValues: number[]; // Store raw values for debugging
    }> = {};

    // DEBUG: Check multiple services for cobro_cliente handling
    const sampleSize = Math.min(20, serviciosData.length);
    console.log(`Examining ${sampleSize} sample services for cobro_cliente values:`);
    
    for (let i = 0; i < sampleSize; i++) {
      const service = serviciosData[i];
      console.log(`Service #${i+1} (${service.id_servicio || service.id}):`);
      console.log(`  - cobro_cliente (raw): ${service.cobro_cliente}`);
      console.log(`  - cobro_cliente (type): ${typeof service.cobro_cliente}`);
      
      // Try parsing with our utility
      const parsedValue = parseCurrencyValue(service.cobro_cliente);
      console.log(`  - cobro_cliente (parsed): ${parsedValue}`);
      
      // Alternative parsing attempts for comparison
      let altParsed = null;
      if (typeof service.cobro_cliente === 'string') {
        const cleanString = service.cobro_cliente.replace(/[^\d.,]/g, '').replace(',', '.');
        altParsed = parseFloat(cleanString);
      } else if (typeof service.cobro_cliente === 'number') {
        altParsed = service.cobro_cliente;
      }
      console.log(`  - cobro_cliente (alt parse): ${altParsed}`);
    }
    
    // Process each service
    serviciosData.forEach(servicio => {
      if (!servicio.nombre_cliente) return;
      
      const servicioDate = new Date(servicio.fecha_hora_cita || servicio.created_at);
      const isCurrentPeriod = servicioDate >= currentStart && servicioDate <= currentEnd;
      const isPreviousPeriod = servicioDate >= previousStart && servicioDate <= previousEnd;
      
      // Skip if not in either period
      if (!isCurrentPeriod && !isPreviousPeriod) return;
      
      // Initialize client data if needed
      if (!clientData[servicio.nombre_cliente]) {
        clientData[servicio.nombre_cliente] = {
          currentServices: 0,
          previousServices: 0,
          currentGMV: 0,
          previousGMV: 0,
          serviciosIds: new Set(),
          previousServiciosIds: new Set(),
          rawCurrentGmvValues: [],
          rawPreviousGmvValues: []
        };
      }
      
      // Parse cobro_cliente value - use Number() as fallback if parseCurrencyValue fails
      const rawCobroCliente = servicio.cobro_cliente;
      let gmvValue = parseCurrencyValue(rawCobroCliente);
      
      // Additional fallback if cobro_cliente is a number but parseCurrencyValue didn't handle it
      if (gmvValue === 0 && typeof rawCobroCliente === 'number' && !isNaN(rawCobroCliente) && rawCobroCliente > 0) {
        gmvValue = rawCobroCliente;
        console.log(`Used numeric fallback for ${servicio.id_servicio}: ${gmvValue}`);
      }
      
      // Track unique service IDs per period (to avoid double-counting)
      if (isCurrentPeriod) {
        const serviceId = servicio.id_servicio || servicio.id;
        if (serviceId) {
          clientData[servicio.nombre_cliente].serviciosIds.add(serviceId);
        }
        
        // Add GMV value to current period
        if (gmvValue > 0) {
          clientData[servicio.nombre_cliente].currentGMV += gmvValue;
          clientData[servicio.nombre_cliente].rawCurrentGmvValues.push(gmvValue);
        }
        
      } else if (isPreviousPeriod) {
        const serviceId = servicio.id_servicio || servicio.id;
        if (serviceId) {
          clientData[servicio.nombre_cliente].previousServiciosIds.add(serviceId);
        }
        
        // Add GMV value to previous period
        if (gmvValue > 0) {
          clientData[servicio.nombre_cliente].previousGMV += gmvValue;
          clientData[servicio.nombre_cliente].rawPreviousGmvValues.push(gmvValue);
        }
      }
    });
    
    // Debug: log GMV data for top clients
    console.log("GMV data for all clients:");
    Object.entries(clientData).forEach(([client, data]) => {
      // Sample of raw values (up to 5) for debugging
      const currentSamples = data.rawCurrentGmvValues.slice(0, 5);
      const previousSamples = data.rawPreviousGmvValues.slice(0, 5);
      
      console.log(`${client}:`);
      console.log(`  - Current GMV: ${data.currentGMV} (from ${data.rawCurrentGmvValues.length} values)`);
      console.log(`  - Current GMV samples: [${currentSamples.join(', ')}]`);
      console.log(`  - Previous GMV: ${data.previousGMV} (from ${data.rawPreviousGmvValues.length} values)`);
      console.log(`  - Previous GMV samples: [${previousSamples.join(', ')}]`);
    });
    
    // Calculate final metrics for each client
    const growthData: ClientGrowthData[] = Object.entries(clientData).map(([nombre_cliente, data]) => {
      // Count unique service IDs per period
      const currentServices = data.serviciosIds.size;
      const previousServices = data.previousServiciosIds.size;
      
      // Calculate service change
      const serviceChange = currentServices - previousServices;
      const servicePercentChange = previousServices > 0 
        ? (serviceChange / previousServices) * 100 
        : currentServices > 0 ? 100 : 0;
      
      // Calculate GMV change
      const gmvChange = data.currentGMV - data.previousGMV;
      const gmvPercentChange = data.previousGMV > 0 
        ? (gmvChange / data.previousGMV) * 100 
        : data.currentGMV > 0 ? 100 : 0;
        
      return {
        nombre_cliente,
        totalServicios: {
          current: currentServices,
          previous: previousServices,
          change: serviceChange,
          percentChange: servicePercentChange
        },
        gmv: {
          current: data.currentGMV,
          previous: data.previousGMV,
          change: gmvChange,
          percentChange: gmvPercentChange
        }
      };
    });
    
    // Log sample of the processed data
    console.log("Client growth data sample:", growthData.slice(0, 3));
    
    return growthData;
  }, [serviciosData, dateRange, comparisonDateRange]);
  
  // Sort data by growth/decline based on selected metric
  const growingClients = useMemo(() => {
    return clientGrowthData
      .filter(client => sortMetric === 'services' 
        ? client.totalServicios.change > 0
        : client.gmv.change > 0
      )
      .sort((a, b) => sortMetric === 'services'
        ? b.totalServicios.percentChange - a.totalServicios.percentChange 
        : b.gmv.percentChange - a.gmv.percentChange
      );
  }, [clientGrowthData, sortMetric]);
  
  const decliningClients = useMemo(() => {
    return clientGrowthData
      .filter(client => sortMetric === 'services' 
        ? client.totalServicios.change < 0
        : client.gmv.change < 0
      )
      .sort((a, b) => sortMetric === 'services'
        ? a.totalServicios.percentChange - b.totalServicios.percentChange 
        : a.gmv.percentChange - b.gmv.percentChange
      );
  }, [clientGrowthData, sortMetric]);
  
  // Function to render client rows
  const renderClientRows = (clients: ClientGrowthData[], showAll = false) => {
    const clientsToShow = showAll ? clients : clients.slice(0, 5);

    if (clientsToShow.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
            No hay datos disponibles
          </TableCell>
        </TableRow>
      );
    }
    
    return clientsToShow.map((client, index) => (
      <TableRow key={`${client.nombre_cliente}-${index}`} className="hover:bg-gray-50">
        <TableCell>{client.nombre_cliente || `Cliente ${index + 1}`}</TableCell>
        <TableCell className="text-right font-medium">
          {formatNumber(client.totalServicios.current)}
        </TableCell>
        <TableCell className="text-right">
          {formatNumber(client.totalServicios.previous)}
        </TableCell>
        <TableCell className="text-right">
          {formatCurrency(client.gmv.current)}
        </TableCell>
        <TableCell className="text-right">
          <div className="flex items-center justify-end gap-1">
            {sortMetric === 'services' ? (
              <Badge className={client.totalServicios.change > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                {client.totalServicios.change > 0 ? '+' : ''}
                {formatPercentage(client.totalServicios.percentChange)}
              </Badge>
            ) : (
              <Badge className={client.gmv.change > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                {client.gmv.change > 0 ? '+' : ''}
                {formatPercentage(client.gmv.percentChange)}
              </Badge>
            )}
            {client.totalServicios.change > 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </div>
        </TableCell>
      </TableRow>
    ));
  };

  if (isLoading) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium flex items-center">
            Análisis de Crecimiento de Clientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="h-4 w-full bg-gray-100 rounded animate-pulse"></div>
            <div className="h-4 w-full bg-gray-100 rounded animate-pulse"></div>
            <div className="h-4 w-full bg-gray-100 rounded animate-pulse"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-1">
        <CardTitle className="text-lg font-medium flex items-center justify-between">
          <span>Análisis de Crecimiento de Clientes</span>
          <div className="flex items-center">
            <Tabs defaultValue="services" className="w-[260px]" onValueChange={(value) => setSortMetric(value as 'services' | 'gmv')}>
              <TabsList>
                <TabsTrigger value="services">Por Servicios</TabsTrigger>
                <TabsTrigger value="gmv">Por GMV</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Growing Clients Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-md font-semibold flex items-center gap-2">
              <ArrowUp className="h-5 w-5 text-green-600" />
              <span className="text-green-700">Clientes en Crecimiento</span>
              <Badge variant="secondary">{growingClients.length}</Badge>
            </h3>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setExpandedGrowth(!expandedGrowth)}
              className="text-sm"
              disabled={growingClients.length <= 5}
            >
              {expandedGrowth ? 'Ver menos' : 'Ver todos'} 
              {expandedGrowth ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}
            </Button>
          </div>
          
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold text-xs">Cliente</TableHead>
                  <TableHead className="text-right font-semibold text-xs">Servicios Actual</TableHead>
                  <TableHead className="text-right font-semibold text-xs">Anterior</TableHead>
                  <TableHead className="text-right font-semibold text-xs">GMV</TableHead>
                  <TableHead className="text-right font-semibold text-xs">Variación</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {renderClientRows(growingClients, expandedGrowth)}
              </TableBody>
            </Table>
          </div>
        </div>
        
        {/* Declining Clients Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-md font-semibold flex items-center gap-2">
              <ArrowDown className="h-5 w-5 text-red-600" />
              <span className="text-red-700">Clientes en Declive</span>
              <Badge variant="secondary">{decliningClients.length}</Badge>
            </h3>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setExpandedDecline(!expandedDecline)}
              className="text-sm"
              disabled={decliningClients.length <= 5}
            >
              {expandedDecline ? 'Ver menos' : 'Ver todos'} 
              {expandedDecline ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}
            </Button>
          </div>
          
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold text-xs">Cliente</TableHead>
                  <TableHead className="text-right font-semibold text-xs">Servicios Actual</TableHead>
                  <TableHead className="text-right font-semibold text-xs">Anterior</TableHead>
                  <TableHead className="text-right font-semibold text-xs">GMV</TableHead>
                  <TableHead className="text-right font-semibold text-xs">Variación</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {renderClientRows(decliningClients, expandedDecline)}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
