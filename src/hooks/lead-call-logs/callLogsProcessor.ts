
import { VapiCallLog } from '@/components/leads/types';

/**
 * Processes call logs to ensure consistency and proper formatting
 */
export function processCallLogs(data: any[], phoneNumber: string | null): VapiCallLog[] {
  // Process call logs to ensure durations are handled correctly
  return data.map(log => {
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
    
    // Check if customer_number is null or empty
    if (!log.customer_number && phoneNumber) {
      return {
        ...log,
        // Add the phone number to the customer_number field for display purposes
        customer_number: phoneNumber
      };
    }
    
    return log;
  });
}
