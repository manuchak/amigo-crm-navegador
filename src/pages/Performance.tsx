
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CustodioPerformanceMetrics } from "@/components/performance/CustodioPerformanceMetrics";
import { PerformanceCharts } from "@/components/performance/PerformanceCharts";

export default function Performance() {
  return (
    <div className="container mx-auto py-20 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Performance de Custodios</h1>
      </div>
      
      <CustodioPerformanceMetrics />
      <PerformanceCharts />
    </div>
  );
}
