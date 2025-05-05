
import React, { useState, useEffect } from 'react';
import { PerformanceFilterHeader } from "@/components/performance/PerformanceFilterHeader";
import { PerformanceTabs } from "@/components/performance/PerformanceTabs";
import { DateRangeWithComparison } from "@/components/performance/filters/AdvancedDateRangePicker";
import { getInitialDateRange, getDefaultDatePresets } from "@/components/performance/config/datePresets";
import { Button } from "@/components/ui/button";
import { UsersRound } from "lucide-react";
import { DriverGroupsManagement } from "@/components/performance/driver-behavior/groups/DriverGroupsManagement";

export default function Performance() {
  // Initialize with the "last 30 days" preset
  const [dateRange, setDateRange] = useState<DateRangeWithComparison>(getInitialDateRange());
  
  // Get date range presets
  const presets = getDefaultDatePresets();

  const [activeTab, setActiveTab] = useState<string>("servicios");
  const [isGroupsManagementOpen, setIsGroupsManagementOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<string | undefined>(undefined);
  
  useEffect(() => {
    // Log the selected date range on component mount and whenever it changes
    console.log("Current date range in Performance component:", {
      from: dateRange.primary.from ? dateRange.primary.from.toLocaleDateString() : 'undefined',
      to: dateRange.primary.to ? dateRange.primary.to.toLocaleDateString() : 'undefined',
      comparisonType: dateRange.comparisonType
    });
  }, [dateRange]);

  // Open driver groups management with the selected client
  const handleOpenGroupsManagement = (client?: string) => {
    setSelectedClient(client);
    setIsGroupsManagementOpen(true);
  };
  
  return (
    <div className="max-w-[2400px] w-full mx-auto space-y-6 pt-20 pb-6 px-4 md:px-6 lg:px-8 xl:px-10 2xl:px-12">
      <PerformanceFilterHeader 
        dateRange={dateRange}
        setDateRange={setDateRange}
        presets={presets}
        activeTab={activeTab}
        showHeaderTitle={true} // This displays the page title
      />
      
      <div className="flex justify-between items-center">
        <div className="flex-1">
          <PerformanceTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            dateRange={{
              primary: dateRange.primary,
              comparison: dateRange.comparisonType !== 'none' ? dateRange.comparison : undefined
            }}
            onOpenGroupsManagement={handleOpenGroupsManagement}
          />
        </div>
        
        {activeTab === "driverBehavior" && (
          <Button 
            variant="outline" 
            className="flex items-center gap-2 ml-2"
            onClick={() => handleOpenGroupsManagement(selectedClient)}
          >
            <UsersRound className="w-4 h-4" />
            <span>Gestionar Grupos</span>
          </Button>
        )}
      </div>
      
      {/* Driver Groups Management Sheet */}
      <DriverGroupsManagement 
        isOpen={isGroupsManagementOpen}
        onClose={() => setIsGroupsManagementOpen(false)}
        selectedClient={selectedClient}
      />
    </div>
  );
}
