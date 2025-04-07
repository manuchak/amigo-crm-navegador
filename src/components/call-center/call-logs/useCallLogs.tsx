
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { VapiCallLog, SyncStats } from './types';
import { CallFilters } from '../VapiCallFilters';
import { applyFilters } from './utils';

interface UseCallLogsProps {
  limit: number;
  onRefresh?: () => void;
}

export const useCallLogs = ({ limit, onRefresh }: UseCallLogsProps) => {
  const [callLogs, setCallLogs] = useState<VapiCallLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<VapiCallLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [selectedLog, setSelectedLog] = useState<VapiCallLog | null>(null);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('details');
  const [syncStats, setSyncStats] = useState<SyncStats | null>(null);
  const [columnView, setColumnView] = useState<'standard' | 'extended'>('standard');
  const [filters, setFilters] = useState<CallFilters>({
    status: null,
    direction: null,
    duration: null,
    dateRange: null
  });

  const fetchCallLogs = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('vapi_call_logs')
        .select('*')
        .order('start_time', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      if (data) {
        console.log('Fetched logs:', data.slice(0, 2));
        const logs = data as unknown as VapiCallLog[];
        setCallLogs(logs);
        const filtered = applyFilters(logs, filters);
        setFilteredLogs(filtered);
      } else {
        setCallLogs([]);
        setFilteredLogs([]);
      }
    } catch (error) {
      console.error('Error fetching VAPI call logs:', error);
      toast.error('Error al cargar registros de llamadas');
    } finally {
      setLoading(false);
    }
  }, [limit, filters]);

  const handleFilterChange = useCallback((newFilters: CallFilters) => {
    setFilters(newFilters);
    setFilteredLogs(applyFilters(callLogs, newFilters));
  }, [callLogs]);

  const syncCallLogs = useCallback(async () => {
    setSyncing(true);
    setSyncStats(null);
    try {
      const response = await supabase.functions.invoke('fetch-vapi-logs', {
        method: 'POST',
        body: {},
      });

      if (response.error) {
        throw new Error(response.error.message || 'Error calling VAPI fetch function');
      }

      if (response.data && response.data.success === false) {
        throw new Error(response.data.message || 'Error syncing call logs');
      }

      if (response.data) {
        setSyncStats({
          total: response.data.total_logs || 0,
          inserted: response.data.inserted || 0,
          updated: response.data.updated || 0,
          errors: response.data.errors || 0
        });
      }

      const message = response.data?.message || 'Registros sincronizados con éxito';
      toast.success(message);
      
      fetchCallLogs();
      
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error('Error syncing VAPI call logs:', error);
      toast.error(`Error al sincronizar: ${error.message || 'Error desconocido'}`);
    } finally {
      setSyncing(false);
    }
  }, [fetchCallLogs, onRefresh]);

  const handleViewDetails = useCallback((log: VapiCallLog) => {
    setSelectedLog(log);
    setDialogOpen(true);
  }, []);

  const toggleColumnView = useCallback(() => {
    setColumnView(prev => prev === 'standard' ? 'extended' : 'standard');
  }, []);

  useEffect(() => {
    fetchCallLogs();
  }, [fetchCallLogs]);

  return {
    callLogs,
    filteredLogs,
    loading,
    syncing,
    selectedLog,
    dialogOpen,
    activeTab,
    syncStats,
    columnView,
    filters,
    setCallLogs,
    setFilteredLogs,
    setLoading,
    setSyncing,
    setSelectedLog,
    setDialogOpen,
    setActiveTab,
    setSyncStats,
    setColumnView,
    fetchCallLogs,
    handleFilterChange,
    syncCallLogs,
    handleViewDetails,
    toggleColumnView
  };
};
