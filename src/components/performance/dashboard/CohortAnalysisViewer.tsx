
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CohortRetentionChart } from './charts/CohortRetentionChart';
import { ServiciosCohortChart } from './charts/ServiciosCohortChart';
import { DateRange } from "react-day-picker";

interface CohortAnalysisViewerProps {
  data?: any[];
  isLoading: boolean;
  dateRange: DateRange;
}

export function CohortAnalysisViewer({ data, isLoading, dateRange }: CohortAnalysisViewerProps) {
  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <CardTitle className="text-lg font-medium">Análisis de Cohortes</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="table" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="table">Tabla de Retención</TabsTrigger>
            <TabsTrigger value="chart">Gráfico de Cohortes</TabsTrigger>
          </TabsList>
          
          <TabsContent value="table">
            <CohortRetentionChart 
              data={data} 
              isLoading={isLoading} 
              dateRange={dateRange} 
            />
          </TabsContent>
          
          <TabsContent value="chart">
            <ServiciosCohortChart 
              data={data} 
              isLoading={isLoading} 
              dateRange={dateRange} 
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
