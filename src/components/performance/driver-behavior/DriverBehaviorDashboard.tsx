
import React, { useState } from 'react';
import { DateRange } from "react-day-picker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { ProductivityDashboard } from './productivity/ProductivityDashboard';
import { DriverBehaviorFiltersPanel } from './DriverBehaviorFiltersPanel';
import { DriverBehaviorMetricsCards } from './DriverBehaviorMetricsCards';
import { DriverBehaviorChart } from './DriverBehaviorChart';
import { DriverBehaviorTable } from './DriverBehaviorTable';
import { DriverRiskAssessment } from './DriverRiskAssessment';
import { TopDriversPanel } from './TopDriversPanel';
import { CO2EmissionsCard } from './CO2EmissionsCard';
import { DriverBehaviorFilters } from '../types/driver-behavior.types';

interface DriverBehaviorDashboardProps {
  dateRange: DateRange;
  comparisonRange?: DateRange;
}

export function DriverBehaviorDashboard({ dateRange, comparisonRange }: DriverBehaviorDashboardProps) {
  const [activeTab, setActiveTab] = useState('resumen');
  const [filters, setFilters] = useState<DriverBehaviorFilters>({});
  
  return (
    <div className="space-y-6 pb-8">
      <Card className="bg-white/90 backdrop-blur-sm rounded-xl shadow-sm border">
        <CardContent className="p-5">
          <DriverBehaviorFiltersPanel 
            onFiltersChange={setFilters} 
            activeTab={activeTab}
            currentFilters={filters}
          />
        </CardContent>
      </Card>
      
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <div className="flex justify-center">
          <TabsList className="bg-white/90 backdrop-blur-sm border shadow-sm rounded-xl p-1.5">
            <TabsTrigger 
              value="resumen" 
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg px-5 py-2.5 text-sm"
            >
              Resumen
            </TabsTrigger>
            <TabsTrigger 
              value="riesgo" 
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg px-5 py-2.5 text-sm"
            >
              Riesgo y Conductores
            </TabsTrigger>
            <TabsTrigger 
              value="productividad" 
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg px-5 py-2.5 text-sm"
            >
              Productividad
            </TabsTrigger>
            <TabsTrigger 
              value="detalles" 
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg px-5 py-2.5 text-sm"
            >
              Detalles
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="resumen" className="mt-0 space-y-8 animate-fade-in duration-300">
          <DriverBehaviorMetricsCards dateRange={dateRange} filters={filters} />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="col-span-1 lg:col-span-2 bg-white/90 backdrop-blur-sm shadow-sm border rounded-xl">
              <CardContent className="p-6">
                <DriverBehaviorChart dateRange={dateRange} filters={filters} />
              </CardContent>
            </Card>
            <Card className="bg-white/90 backdrop-blur-sm shadow-sm border rounded-xl">
              <CardContent className="p-6">
                <CO2EmissionsCard dateRange={dateRange} filters={filters} />
              </CardContent>
            </Card>
          </div>
          <DriverBehaviorTable dateRange={dateRange} filters={filters} />
        </TabsContent>
        
        <TabsContent value="riesgo" className="mt-0 animate-fade-in duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <DriverRiskAssessment dateRange={dateRange} filters={filters} />
            <TopDriversPanel dateRange={dateRange} filters={filters} />
          </div>
        </TabsContent>
        
        <TabsContent value="productividad" className="mt-0 animate-fade-in duration-300">
          <ProductivityDashboard dateRange={dateRange} filters={filters} />
        </TabsContent>
        
        <TabsContent value="detalles" className="mt-0 animate-fade-in duration-300">
          <div className="p-8 text-center text-gray-500">
            Detalles detallados próximamente
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
