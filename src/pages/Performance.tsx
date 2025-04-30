
import React, { useState, useEffect } from 'react';
import { CustodioPerformanceDashboard } from "@/components/performance/CustodioPerformanceDashboard";
import { PerformanceHeader } from "@/components/performance/PerformanceHeader";
import { DriverBehaviorHeader } from "@/components/performance/DriverBehaviorHeader";
import { ServiciosDashboard } from "@/components/performance/dashboard/ServiciosDashboard";
import { DriverBehaviorDashboard } from "@/components/performance/driver-behavior/DriverBehaviorDashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DateRangeWithComparison, DateRangePreset } from "@/components/performance/filters/AdvancedDateRangePicker";
import { subDays, startOfMonth, endOfMonth } from "date-fns";
import { PerformanceDateFilter } from '@/components/performance/PerformanceDateFilter';
import { ServiceImport } from '@/components/performance/filters/ServiceImport';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function Performance() {
  // Initialize with the "last 30 days" preset for better performance
  const [dateRange, setDateRange] = useState<DateRangeWithComparison>({
    primary: {
      from: subDays(new Date(), 29), // Start 30 days ago
      to: new Date(), // End today
    },
    comparisonType: 'none',
    rangeType: 'last30days'
  });

  // Add presets for the current month, previous month, etc.
  const presets: DateRangePreset[] = [
    { 
      label: "Este mes", 
      value: "thisMonth",
      getDateRange: () => {
        const now = new Date();
        return {
          from: startOfMonth(now),
          to: endOfMonth(now)
        };
      }
    },
    { 
      label: "Mes anterior", 
      value: "lastMonth",
      getDateRange: () => {
        const now = new Date();
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1);
        return {
          from: startOfMonth(lastMonth),
          to: endOfMonth(lastMonth)
        };
      }
    },
    { 
      label: "Últimos 30 días", 
      value: "last30days",
      getDateRange: () => {
        return {
          from: subDays(new Date(), 29),
          to: new Date()
        };
      }
    },
    { 
      label: "Últimos 90 días", 
      value: "last90days",
      getDateRange: () => {
        return {
          from: subDays(new Date(), 89),
          to: new Date()
        };
      }
    }
  ];

  const [activeTab, setActiveTab] = useState<string>("servicios");
  
  // List available clients for filter dropdown
  const { data: clientsData } = useQuery({
    queryKey: ['servicios-clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('servicios_custodia')
        .select('nombre_cliente')
        .not('nombre_cliente', 'is', null)
        .order('nombre_cliente')
        .limit(100);
      
      if (error) throw error;
      
      // Get unique clients
      const uniqueClients = Array.from(new Set(
        data.map(item => item.nombre_cliente)
      )).filter(Boolean);
      
      return uniqueClients;
    },
    staleTime: 1000 * 60 * 10 // 10 minutes
  });
  
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
    <div className="max-w-[2400px] w-full mx-auto space-y-6 py-6 px-4 md:px-6 lg:px-8 xl:px-10 2xl:px-12">
      <div className="mb-2">
        {renderHeader()}
      </div>
      
      <Card className="border shadow-sm bg-white/90 backdrop-blur-sm p-4 rounded-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <PerformanceDateFilter 
            dateRange={dateRange} 
            setDateRange={handleDateRangeChange}
            presets={presets}
          />
          
          {activeTab === "servicios" && (
            <div className="flex-shrink-0">
              <ServiceImport onImportComplete={handleImportComplete} />
            </div>
          )}
        </div>
      </Card>
      
      <div>
        <Tabs 
          defaultValue="servicios" 
          className="w-full"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList className="mb-6 bg-background/70 border shadow-sm rounded-xl p-1.5 w-auto inline-flex">
            <TabsTrigger value="servicios" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg px-5 py-2.5 text-sm">
              Servicios
            </TabsTrigger>
            <TabsTrigger value="custodios" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg px-5 py-2.5 text-sm">
              Custodios
            </TabsTrigger>
            <TabsTrigger value="driverBehavior" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg px-5 py-2.5 text-sm">
              Comportamiento de Conducción
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="servicios" className="mt-0 animate-fade-in duration-300">
            <ServiciosDashboard 
              dateRange={dateRange.primary} 
              comparisonRange={dateRange.comparisonType !== 'none' ? dateRange.comparison : undefined} 
            />
          </TabsContent>
          
          <TabsContent value="custodios" className="mt-0 animate-fade-in duration-300">
            <CustodioPerformanceDashboard 
              dateRange={dateRange.primary} 
              comparisonRange={dateRange.comparisonType !== 'none' ? dateRange.comparison : undefined} 
            />
          </TabsContent>
          
          <TabsContent value="driverBehavior" className="mt-0 animate-fade-in duration-300">
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
