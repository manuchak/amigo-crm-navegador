
import React, { useState, useEffect } from 'react';
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
import { useQuery } from '@tanstack/react-query';
import { fetchDriverBehaviorData } from '../services/driverBehavior/dataService';
import { motion } from 'framer-motion';

interface DriverBehaviorDashboardProps {
  dateRange: DateRange;
  comparisonRange?: DateRange;
}

export function DriverBehaviorDashboard({ dateRange, comparisonRange }: DriverBehaviorDashboardProps) {
  const [activeTab, setActiveTab] = useState('resumen');
  const [filters, setFilters] = useState<DriverBehaviorFilters>({});
  
  // Fetch driver behavior data with filters
  const { data: driverData, isLoading: isLoadingData } = useQuery({
    queryKey: ['driver-behavior-data', dateRange, filters],
    queryFn: () => fetchDriverBehaviorData(dateRange, filters),
    enabled: !!dateRange.from && !!dateRange.to,
  });

  // Fetch comparison data when needed
  const { data: comparisonData, isLoading: isLoadingComparison } = useQuery({
    queryKey: ['driver-behavior-comparison', comparisonRange, filters],
    queryFn: () => comparisonRange ? fetchDriverBehaviorData(comparisonRange, filters) : null,
    enabled: !!comparisonRange?.from && !!comparisonRange?.to,
  });

  return (
    <div className="space-y-6 pb-8">
      <Card className="bg-white/90 backdrop-blur-sm rounded-xl shadow-sm border">
        <CardContent className="p-5">
          <DriverBehaviorFiltersPanel 
            onFilterChange={setFilters} 
            activeTab={activeTab}
            filters={filters}
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
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <DriverBehaviorMetricsCards 
              data={driverData} 
              comparisonData={comparisonData} 
              isLoading={isLoadingData} 
            />
          </motion.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <motion.div 
              className="col-span-1 lg:col-span-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <Card className="bg-white/90 backdrop-blur-sm shadow-sm border rounded-xl">
                <CardContent className="p-6">
                  <DriverBehaviorChart 
                    data={driverData?.driverScores} 
                    isLoading={isLoadingData} 
                    dateRange={dateRange} 
                  />
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <Card className="bg-white/90 backdrop-blur-sm shadow-sm border rounded-xl">
                <CardContent className="p-6">
                  <CO2EmissionsCard 
                    data={driverData} 
                    isLoading={isLoadingData} 
                  />
                </CardContent>
              </Card>
            </motion.div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <DriverBehaviorTable dateRange={dateRange} filters={filters} />
          </motion.div>
        </TabsContent>
        
        <TabsContent value="riesgo" className="mt-0 animate-fade-in duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <DriverRiskAssessment 
              riskData={driverData?.riskAssessment} 
              isLoading={isLoadingData} 
            />
            <TopDriversPanel 
              data={driverData?.driverPerformance} 
              isLoading={isLoadingData} 
            />
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
