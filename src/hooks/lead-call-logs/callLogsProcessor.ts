
import { VapiCallLog } from '@/components/leads/types';

/**
 * Calculates and sets the duration for call logs
 * @param logs The call logs to process
 * @param defaultPhoneNumber A fallback phone number to use if customer_number is missing
 */
export function processCallLogs(logs: VapiCallLog[], defaultPhoneNumber: string | null = null): VapiCallLog[] {
  if (!logs || logs.length === 0) {
    return [];
  }
  
  return logs.map(log => {
    // If duration is missing or zero but we have start and end times, calculate it
    if ((log.duration === null || log.duration === undefined || log.duration === 0) && log.start_time && log.end_time) {
      try {
        const startDate = new Date(log.start_time);
        const endDate = new Date(log.end_time);
        
        if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
          // Calculate duration in seconds
          log.duration = Math.floor((endDate.getTime() - startDate.getTime()) / 1000);
          console.log(`Calculated duration from timestamps: ${log.duration}s`);
        }
      } catch (e) {
        console.error("Error calculating duration:", e);
      }
    }
    
    // Check if customer_number is null or empty and we have a default
    if (!log.customer_number && defaultPhoneNumber) {
      return {
        ...log,
        customer_number: defaultPhoneNumber
      };
    }
    
    return log;
  });
}
