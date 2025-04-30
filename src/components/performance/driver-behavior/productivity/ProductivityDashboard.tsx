
import React from 'react';
import { DateRange } from "react-day-picker";
import { ProductivityMetricsCards } from './ProductivityMetricsCards';
import { ProductivityAnalysisTable } from './ProductivityAnalysisTable';
import { ProductivityParametersDialog } from './ProductivityParametersDialog';
import { ProductivityParametersTable } from './ProductivityParametersTable';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

interface ProductivityDashboardProps {
  dateRange: DateRange;
}

export function ProductivityDashboard({ dateRange }: ProductivityDashboardProps) {
  const [showParameters, setShowParameters] = React.useState(false);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Análisis de Productividad</h3>
        <Button 
          variant="outline" 
          size="sm"
          className="h-9"
          onClick={() => setShowParameters(true)}
        >
          <Settings className="h-4 w-4 mr-2" />
          Configurar Parámetros
        </Button>
      </div>
      
      <ProductivityMetricsCards 
        dateRange={dateRange}
      />
      
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium">Análisis por Conductor</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductivityAnalysisTable 
              dateRange={dateRange}
            />
          </CardContent>
        </Card>
      </div>
      
      {/* Parameters Dialog */}
      <ProductivityParametersDialog 
        open={showParameters}
        onClose={() => setShowParameters(false)}
      />
      
      {/* Parameters Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium">Parámetros de Productividad</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductivityParametersTable />
        </CardContent>
      </Card>
    </div>
  );
}
