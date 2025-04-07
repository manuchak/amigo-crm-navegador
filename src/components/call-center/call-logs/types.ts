
import { Dispatch, SetStateAction } from 'react';

export interface VapiCallLog {
  id: string;
  log_id: string;
  assistant_id: string;
  assistant_name: string | null;
  organization_id: string;
  conversation_id: string | null;
  phone_number: string | null;
  caller_phone_number: string | null;
  customer_number: string | null;
  assistant_phone_number: string | null;
  call_type: string | null;
  start_time: string | null;
  end_time: string | null;
  duration: number | null;
  status: string | null;
  direction: string | null;
  transcript: any | null;
  recording_url: string | null;
  metadata: any | null;
  created_at: string | null;
  updated_at: string | null;
  ended_reason: string | null;
  cost: number | null;
  success_evaluation: string | null;
}

export interface SyncStats {
  total: number;
  inserted: number;
  updated: number;
  errors: number;
}

export interface CallLogContextProps {
  callLogs: VapiCallLog[];
  filteredLogs: VapiCallLog[];
  loading: boolean;
  syncing: boolean;
  selectedLog: VapiCallLog | null;
  dialogOpen: boolean;
  activeTab: string;
  syncStats: SyncStats | null;
  columnView: 'standard' | 'extended';
  setCallLogs: Dispatch<SetStateAction<VapiCallLog[]>>;
  setFilteredLogs: Dispatch<SetStateAction<VapiCallLog[]>>;
  setLoading: Dispatch<SetStateAction<boolean>>;
  setSyncing: Dispatch<SetStateAction<boolean>>;
  setSelectedLog: Dispatch<SetStateAction<VapiCallLog | null>>;
  setDialogOpen: Dispatch<SetStateAction<boolean>>;
  setActiveTab: Dispatch<SetStateAction<string>>;
  setSyncStats: Dispatch<SetStateAction<SyncStats | null>>;
  setColumnView: Dispatch<SetStateAction<'standard' | 'extended'>>;
}
