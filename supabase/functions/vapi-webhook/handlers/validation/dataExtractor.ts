
/**
 * Utilities for extracting data from webhook payloads
 */
import { extractInfoFromTranscript } from "../../utils/transcriptProcessor.ts";
import { ExtractedLeadInfo } from "./types.ts";

/**
 * Helper to extract information directly from webhook data
 */
export function extractInfoFromDirectData(data: any): ExtractedLeadInfo {
  // Extract relevant fields from direct data
  return {
    car_brand: data.car_brand || data.carBrand || null,
    car_model: data.car_model || data.carModel || null,
    car_year: data.car_year || data.carYear || null,
    custodio_name: data.custodio_name || data.lead_name || data.nombre || null,
    security_exp: data.security_exp || data.security_experience || data.experienciaseguridad || null,
    sedena_id: data.sedena_id || data.credencialsedena || null
  };
}

/**
 * Extract information from various data sources
 */
export function extractInformation(webhookData: any, callLogData: any): ExtractedLeadInfo {
  // First try to extract from the direct webhook data
  if (webhookData && typeof webhookData === 'object' && (webhookData.car_brand || webhookData.car_model || webhookData.lead_name)) {
    console.log("Extracting info from direct webhook data");
    return extractInfoFromDirectData(webhookData);
  } else {
    // Fall back to transcript if available
    const transcript = callLogData?.transcript || webhookData.transcript;
    console.log("Extracting info from transcript");
    return extractInfoFromTranscript(transcript);
  }
}
