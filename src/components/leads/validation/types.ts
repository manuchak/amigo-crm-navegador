
export interface CustodioValidation {
  id: string;
  lead_id: number;
  validated_by: string | null;
  validation_date: string;
  status: 'pending' | 'approved' | 'rejected';
  
  // Validation criteria
  has_security_experience: boolean | null;
  has_military_background: boolean | null;
  has_vehicle: boolean | null;
  has_firearm_license: boolean | null;
  age_requirement_met: boolean | null;
  interview_passed: boolean | null;
  background_check_passed: boolean | null;
  
  // Notes
  rejection_reason: string | null;
  additional_notes: string | null;
  
  // Scores
  call_quality_score: number | null;
  communication_score: number | null;
  reliability_score: number | null;
  
  // Performance tracking
  validation_duration_seconds: number | null;
  created_at: string;
  updated_at: string;
  
  // Lifetime identifier
  lifetime_id: string | null;
}

export interface ValidationStats {
  validation_day: string;
  status: string | null;
  validation_count: number | null;
  avg_duration: number | null;
  avg_call_quality: number | null;
  avg_communication: number | null;
  avg_reliability: number | null;
}

export interface ValidationFormData {
  has_security_experience: boolean | null;
  has_military_background: boolean | null;
  has_vehicle: boolean | null;
  has_firearm_license: boolean | null;
  age_requirement_met: boolean | null;
  interview_passed: boolean | null;
  background_check_passed: boolean | null;
  call_quality_score: number | null;
  communication_score: number | null;
  reliability_score: number | null;
  rejection_reason: string;
  additional_notes: string;
  forced_status?: 'approved' | 'rejected'; // Add this field for owner overrides
}
