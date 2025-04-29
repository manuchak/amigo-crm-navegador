
import React, { useState, useEffect } from 'react';
import { CustodioPerformanceDashboard } from "@/components/performance/CustodioPerformanceDashboard";
import { PerformanceHeader } from "@/components/performance/PerformanceHeader";
import { DriverBehaviorHeader } from "@/components/performance/DriverBehaviorHeader";
import { ServiciosDashboard } from "@/components/performance/dashboard/ServiciosDashboard";
import { DriverBehaviorDashboard } from "@/components/performance/driver-behavior/DriverBehaviorDashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DateRangeWithComparison } from "@/components/performance/filters/AdvancedDateRangePicker";
import { subDays } from "date-fns";
import { PerformanceDateFilter } from '@/components/performance/PerformanceDateFilter';
import { ServiceImport } from '@/components/performance/filters/ServiceImport';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

export default function Performance() {
  // Initialize with the "last 90 days" preset - ensures we always have a valid date range
  const [dateRange, setDateRange] = useState<DateRangeWithComparison>({
    primary: {
      from: subDays(new Date(), 89), // Start 90 days ago
      to: new Date(), // End today
    },
    comparisonType: 'none',
    rangeType: 'last90days'
  });

  const [activeTab, setActiveTab] = useState<string>("servicios");
  
  useEffect(() => {
    // Log the selected date range on component mount and whenever it changes
    console.log("Current date range in Performance component:", {
      from: dateRange.primary.from ? dateRange.primary.from.toLocaleDateString() : 'undefined',
      to: dateRange.primary.to ? dateRange.primary.to.toLocaleDateString() : 'undefined',
      comparisonType: dateRange.comparisonType
    });
  }, [dateRange]);
  
  // Show different header based on active tab
  const renderHeader = () => {
    if (activeTab === "driverBehavior") {
      return <DriverBehaviorHeader />;
    }
    return <PerformanceHeader />;
  };

  // Handle date range changes with validation
  const handleDateRangeChange = (newRange: DateRangeWithComparison) => {
    console.log("Date range changed:", {
      from: newRange.primary.from ? newRange.primary.from.toLocaleDateString() : 'undefined',
      to: newRange.primary.to ? newRange.primary.to.toLocaleDateString() : 'undefined',
      comparisonType: newRange.comparisonType
    });
    
    // Validate that the date range is not too large (e.g., more than 1 year)
    if (newRange.primary.from && newRange.primary.to) {
      const diffTime = Math.abs(newRange.primary.to.getTime() - newRange.primary.from.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays > 365) {
        toast.warning("Rango de fechas demasiado amplio", {
          description: "Por favor seleccione un rango menor a un año para un mejor rendimiento"
        });
        return;
      }
      
      // Ensure the start date is before the end date
      if (newRange.primary.from > newRange.primary.to) {
        toast.warning("Rango de fechas inválido", {
          description: "La fecha de inicio debe ser anterior a la fecha final"
        });
        return;
      }
    }
    
    setDateRange(newRange);
  };
  
  const handleImportComplete = () => {
    // After successful import, refresh the data
    toast.success("Datos importados", {
      description: "Los datos han sido importados correctamente"
    });
  };

  return (
    <div className="container mx-auto space-y-8 py-8 px-4 md:px-6">
      <div>
        {renderHeader()}
      </div>
      
      <Card className="border shadow-sm p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <PerformanceDateFilter dateRange={dateRange} setDateRange={handleDateRangeChange} />
          
          {activeTab === "servicios" && (
            <div className="flex-shrink-0">
              <ServiceImport onImportComplete={handleImportComplete} />
            </div>
          )}
        </div>
      </Card>
      
      <div className="mt-8">
        <Tabs 
          defaultValue="servicios" 
          className="w-full"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList className="mb-6 bg-background border shadow-sm rounded-lg p-1">
            <TabsTrigger value="servicios" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md">Servicios</TabsTrigger>
            <TabsTrigger value="custodios" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md">Custodios</TabsTrigger>
            <TabsTrigger value="driverBehavior" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md">Comportamiento de Conducción</TabsTrigger>
          </TabsList>
          
          <TabsContent value="servicios" className="mt-2 animate-fade-in">
            <ServiciosDashboard 
              dateRange={dateRange.primary} 
              comparisonRange={dateRange.comparisonType !== 'none' ? dateRange.comparison : undefined} 
            />
          </TabsContent>
          
          <TabsContent value="custodios" className="mt-2 animate-fade-in">
            <CustodioPerformanceDashboard 
              dateRange={dateRange.primary} 
              comparisonRange={dateRange.comparisonType !== 'none' ? dateRange.comparison : undefined} 
            />
          </TabsContent>
          
          <TabsContent value="driverBehavior" className="mt-2 animate-fade-in">
            <DriverBehaviorDashboard 
              dateRange={dateRange.primary} 
              comparisonRange={dateRange.comparisonType !== 'none' ? dateRange.comparison : undefined} 
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
