
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useCallLogs } from './call-logs/useCallLogs';
import CallLogsHeader from './call-logs/CallLogsHeader';
import SyncStatsAlert from './call-logs/SyncStatsAlert';
import VapiCallFilters from './VapiCallFilters';
import CallLogsList from './call-logs/CallLogsList';
import CallLogDetail from './call-logs/CallLogDetail';

interface VapiCallLogsProps {
  limit?: number;
  onRefresh?: () => void;
}

const VapiCallLogs: React.FC<VapiCallLogsProps> = ({ limit = 10, onRefresh }) => {
  const {
    filteredLogs,
    loading,
    syncing,
    selectedLog,
    dialogOpen,
    activeTab,
    syncStats,
    columnView,
    filters,
    fetchCallLogs,
    handleFilterChange,
    syncCallLogs,
    handleViewDetails,
    toggleColumnView,
    setDialogOpen,
    setActiveTab
  } = useCallLogs({ limit, onRefresh });

  return (
    <div className="space-y-4">
      <Card>
        <CallLogsHeader
          limit={limit}
          loading={loading}
          syncing={syncing}
          onRefresh={fetchCallLogs}
          onSync={syncCallLogs}
          columnView={columnView}
          onToggleView={toggleColumnView}
        />
        <CardContent>
          {syncStats && <SyncStatsAlert syncStats={syncStats} />}

          <div className="mb-4">
            <VapiCallFilters onFilterChange={handleFilterChange} activeFilters={filters} />
          </div>
          
          <CallLogsList 
            filteredLogs={filteredLogs}
            columnView={columnView}
            loading={loading}
            onViewDetails={handleViewDetails}
            onSyncCallLogs={syncCallLogs}
            syncing={syncing}
          />
        </CardContent>
      </Card>

      <CallLogDetail
        selectedLog={selectedLog}
        dialogOpen={dialogOpen}
        activeTab={activeTab}
        setDialogOpen={setDialogOpen}
        setActiveTab={setActiveTab}
      />
    </div>
  );
};

export default VapiCallLogs;
