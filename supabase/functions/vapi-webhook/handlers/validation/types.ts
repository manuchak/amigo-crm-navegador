
/**
 * Type definitions for lead validation
 */

export interface ExtractedLeadInfo {
  car_brand?: string | null;
  car_model?: string | null;
  car_year?: string | number | null;
  custodio_name?: string | null;
  security_exp?: string | null;
  sedena_id?: string | null;
}

export interface ValidationResult {
  success: boolean;
  error?: any;
  message?: string;
  data?: any;
  validated_lead_id?: number | null;
  linked_lead_id?: number | null;
  extracted_info?: ExtractedLeadInfo;
  requires_lead_assignment?: boolean;
}

export interface LeadData {
  id: number;
  nombre?: string;
  telefono?: string;
  [key: string]: any;
}

export interface ValidatedLeadData {
  id: number;
  car_brand?: string | null;
  car_model?: string | null;
  car_year?: number | null;
  custodio_name?: string | null;
  security_exp?: string | null;
  sedena_id?: string | null;
  call_id?: string | null;
  phone_number?: number | null;
  phone_number_intl?: string | null;
  vapi_call_data?: any;
}
