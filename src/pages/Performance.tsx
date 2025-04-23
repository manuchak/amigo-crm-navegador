
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CustodioPerformanceDashboard } from "@/components/performance/CustodioPerformanceDashboard";
import { PerformanceHeader } from "@/components/performance/PerformanceHeader";
import { PerformanceFilter } from "@/components/performance/PerformanceFilter";

export default function Performance() {
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  });

  return (
    <div className="container mx-auto py-10 space-y-6">
      <PerformanceHeader />
      <PerformanceFilter dateRange={dateRange} setDateRange={setDateRange} />
      <CustodioPerformanceDashboard dateRange={dateRange} />
    </div>
  );
}
