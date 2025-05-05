
import React, { useState, useEffect } from 'react';
import { PerformanceFilterHeader } from "@/components/performance/PerformanceHeader";
import { PerformanceTabs } from "@/components/performance/PerformanceTabs";
import { DateRangeWithComparison } from "@/components/performance/filters/AdvancedDateRangePicker";
import { getInitialDateRange, getDefaultDatePresets } from "@/components/performance/config/datePresets";

export default function Performance() {
  // Initialize with the "last 30 days" preset
  const [dateRange, setDateRange] = useState<DateRangeWithComparison>(getInitialDateRange());
  
  // Get date range presets
  const presets = getDefaultDatePresets();

  const [activeTab, setActiveTab] = useState<string>("servicios");
  
  useEffect(() => {
    // Log the selected date range on component mount and whenever it changes
    console.log("Current date range in Performance component:", {
      from: dateRange.primary.from ? dateRange.primary.from.toLocaleDateString() : 'undefined',
      to: dateRange.primary.to ? dateRange.primary.to.toLocaleDateString() : 'undefined',
      comparisonType: dateRange.comparisonType
    });
  }, [dateRange]);
  
  return (
    <div className="max-w-[2400px] w-full mx-auto space-y-6 py-6 px-4 md:px-6 lg:px-8 xl:px-10 2xl:px-12">
      <PerformanceFilterHeader 
        dateRange={dateRange}
        setDateRange={setDateRange}
        presets={presets}
        activeTab={activeTab}
      />
      
      <div>
        <PerformanceTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          dateRange={{
            primary: dateRange.primary,
            comparison: dateRange.comparisonType !== 'none' ? dateRange.comparison : undefined
          }}
        />
      </div>
    </div>
  );
}
