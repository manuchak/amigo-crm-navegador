
import { Json } from '@/integrations/supabase/types';

export interface VapiCallLog {
  id: string;
  log_id: string;
  assistant_id: string;
  assistant_name: string | null;
  assistant_phone_number: string | null;
  call_type: string | null;
  caller_phone_number: string | null;
  conversation_id: string | null;
  cost: number | null;
  created_at: string | null;
  customer_number: string | null;
  direction: string | null;
  duration: number | null;
  end_time: string | null;
  ended_reason: string | null;
  metadata: Json | null;
  organization_id: string;
  phone_number: string | null;
  recording_url: string | null;
  start_time: string | null;
  status: string | null;
  success_evaluation: string | null;
  transcript: Json | null;
  updated_at: string | null;
}
