
import React, { useState } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import { PerformanceTabs } from '@/components/performance/PerformanceTabs';
import { PerformanceHeader } from '@/components/performance/PerformanceHeader';
import { DateRange } from 'react-day-picker';
import { addDays, subDays } from 'date-fns';
import { DriverGroupsManagement } from '@/components/performance/driver-behavior/groups/DriverGroupsManagement';

const Performance: React.FC = () => {
  // Estado para la pestaña activa
  const [activeTab, setActiveTab] = useState('servicios');
  
  // Estado para el rango de fechas
  const [dateRange, setDateRange] = useState<{
    primary: DateRange;
    comparison?: DateRange;
  }>({
    primary: {
      from: subDays(new Date(), 30),
      to: new Date()
    }
  });
  
  // Estado para el manejo de grupos
  const [isGroupsManagementOpen, setIsGroupsManagementOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<string | undefined>();

  // Manejador para abrir el panel de gestión de grupos
  const handleOpenGroupsManagement = (client?: string) => {
    console.log('Opening groups management with client:', client);
    setSelectedClient(client);
    setIsGroupsManagementOpen(true);
  };

  return (
    <PageLayout title="Performance">
      <div className="space-y-6">
        {/* Header con filtros de fecha */}
        <PerformanceHeader 
          dateRange={dateRange.primary} 
          comparisonRange={dateRange.comparison}
          onDateChange={(primary, comparison) => {
            setDateRange({ primary, comparison });
          }}
        />
        
        {/* Tabs de Performance */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <PerformanceTabs 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            dateRange={dateRange}
            onOpenGroupsManagement={handleOpenGroupsManagement}
          />
        </div>
      </div>

      {/* Panel de gestión de grupos */}
      <DriverGroupsManagement 
        isOpen={isGroupsManagementOpen}
        onClose={() => setIsGroupsManagementOpen(false)}
        selectedClient={selectedClient}
      />
    </PageLayout>
  );
};

export default Performance;
