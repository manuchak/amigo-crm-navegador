
export interface VapiCallLog {
  id: string;
  log_id: string | null;
  assistant_id: string | null;
  assistant_name: string | null;
  organization_id: string | null;
  status: string | null;
  ended_reason: string | null;
  call_type: string | null;
  direction: string | null;
  customer_number: string | null;
  caller_phone_number: string | null;
  phone_number: string | null;
  assistant_phone_number: string | null;
  conversation_id: string | null;
  cost: number | null;
  duration: number | null;
  success_evaluation: string | null;
  start_time: string | null;
  end_time: string | null;
  recording_url: string | null;
  transcript: any | null;
  metadata: any | null;
}
