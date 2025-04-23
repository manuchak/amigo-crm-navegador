
import React, { useState } from 'react';
import { DateRange } from "react-day-picker";
import { CustodioPerformanceDashboard } from "@/components/performance/CustodioPerformanceDashboard";
import { PerformanceHeader } from "@/components/performance/PerformanceHeader";
import { PerformanceFilter } from "@/components/performance/PerformanceFilter";

export default function Performance() {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  });

  const handleDateRangeChange = (range: DateRange | undefined) => {
    if (range) {
      setDateRange(range);
    }
  };

  return (
    <div className="container mx-auto space-y-8 py-8 px-4 md:px-6">
      <PerformanceHeader />
      <PerformanceFilter dateRange={dateRange} setDateRange={handleDateRangeChange} />
      <div className="mt-8">
        <CustodioPerformanceDashboard dateRange={dateRange} />
      </div>
    </div>
  );
}
