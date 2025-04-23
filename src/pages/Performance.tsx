
import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CustodioPerformanceDashboard } from "@/components/performance/CustodioPerformanceDashboard";
import { PerformanceHeader } from "@/components/performance/PerformanceHeader";
import { PerformanceFilter } from "@/components/performance/PerformanceFilter";
import { DateRange } from "react-day-picker";

export default function Performance() {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  });

  return (
    <div className="container mx-auto space-y-8 py-8 px-4 md:px-6">
      <PerformanceHeader />
      <PerformanceFilter dateRange={dateRange} setDateRange={setDateRange} />
      <CustodioPerformanceDashboard dateRange={dateRange} />
    </div>
  );
}
