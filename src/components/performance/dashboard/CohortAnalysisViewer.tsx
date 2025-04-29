import React from 'react';
import { DateRange } from "react-day-picker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ServiciosMetricData } from "../services/servicios/types";

interface CohortAnalysisViewerProps {
  data: ServiciosMetricData;
  isLoading: boolean;
  dateRange: DateRange;
}

export function CohortAnalysisViewer({ data, isLoading, dateRange }: CohortAnalysisViewerProps) {
  if (isLoading) {
    return (
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle>Análisis de Cohortes</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="w-full h-[300px]" />
        </CardContent>
      </Card>
    );
  }

  // This is a placeholder - in a real implementation, you would process the data
  // and show cohort analysis using a specialized chart
  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <CardTitle>Análisis de Cohortes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="p-4 text-center text-muted-foreground">
          Datos insuficientes para el análisis de cohortes.
          <br />
          Se requieren más datos históricos para generar este análisis.
        </div>
      </CardContent>
    </Card>
  );
}
