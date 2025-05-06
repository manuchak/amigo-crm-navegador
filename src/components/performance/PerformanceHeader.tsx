
import React, { useState } from 'react';
import { DateRange } from 'react-day-picker';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PerformanceDateFilter } from './PerformanceDateFilter';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw } from 'lucide-react';

interface PerformanceHeaderProps {
  dateRange: DateRange;
  comparisonRange?: DateRange;
  onDateChange: (primary: DateRange, comparison?: DateRange) => void;
}

export function PerformanceHeader({ 
  dateRange, 
  comparisonRange,
  onDateChange 
}: PerformanceHeaderProps) {
  const [showComparison, setShowComparison] = useState(!!comparisonRange);

  // Manejar la actualización de los rangos de fechas
  const handleDateChange = (newRange: DateRange, newComparisonRange?: DateRange) => {
    onDateChange(newRange, showComparison ? newComparisonRange : undefined);
  };

  // Manejar el cambio en la visualización de comparación
  const handleComparisonToggle = (value: string) => {
    const shouldShowComparison = value === 'compare';
    setShowComparison(shouldShowComparison);
    
    if (!shouldShowComparison) {
      onDateChange(dateRange, undefined);
    }
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm shadow-sm border rounded-xl">
      <CardContent className="p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h2 className="text-xl font-semibold">Dashboard de Performance</h2>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 gap-1 whitespace-nowrap ml-auto sm:ml-2"
              onClick={() => onDateChange({ ...dateRange })}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Actualizar</span>
            </Button>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <Tabs 
              defaultValue={showComparison ? 'compare' : 'single'}
              value={showComparison ? 'compare' : 'single'}
              onValueChange={handleComparisonToggle}
              className="w-auto"
            >
              <TabsList className="h-8 bg-muted/50">
                <TabsTrigger value="single" className="text-xs px-3">
                  Período simple
                </TabsTrigger>
                <TabsTrigger value="compare" className="text-xs px-3">
                  Comparar períodos
                </TabsTrigger>
              </TabsList>
            </Tabs>
            
            <PerformanceDateFilter 
              dateRange={dateRange}
              comparisonRange={showComparison ? comparisonRange : undefined}
              onDateChange={handleDateChange}
              showComparison={showComparison}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
