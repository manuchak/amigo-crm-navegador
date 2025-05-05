
import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DateRangeWithComparison, DateRangePreset } from "./filters/AdvancedDateRangePicker";
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { ServiceImport } from './filters/ServiceImport';
import { PerformanceDateFilter } from './PerformanceDateFilter';
import { DriverBehaviorHeader } from './DriverBehaviorHeader';
import { PerformanceHeader } from './PerformanceHeader';

interface PerformanceFilterHeaderProps {
  dateRange: DateRangeWithComparison;
  setDateRange: (newRange: DateRangeWithComparison) => void;
  presets: DateRangePreset[];
  activeTab: string;
  showHeaderTitle?: boolean;
}

export function PerformanceFilterHeader({ 
  dateRange, 
  setDateRange, 
  presets,
  activeTab,
  showHeaderTitle = true
}: PerformanceFilterHeaderProps) {
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
    <>
      {showHeaderTitle && (
        <div className="mb-2">
          {activeTab === "driverBehavior" ? (
            <DriverBehaviorHeader />
          ) : (
            <PerformanceHeader />
          )}
        </div>
      )}
      
      <Card className="border shadow-sm bg-white/90 backdrop-blur-sm p-4 rounded-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <PerformanceDateFilter 
            dateRange={dateRange} 
            setDateRange={handleDateRangeChange}
            presets={presets}
          />
          
          <div className="flex items-center gap-2">
            {activeTab === "servicios" && (
              <ServiceImport onImportComplete={handleImportComplete} />
            )}
            
            <Button variant="outline" asChild className="flex items-center gap-2">
              <Link to="/active-services">
                <MapPin className="h-4 w-4" />
                <span>Monitoreo en vivo</span>
              </Link>
            </Button>
          </div>
        </div>
      </Card>
    </>
  );
}
