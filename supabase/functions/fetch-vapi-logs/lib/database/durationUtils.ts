
/**
 * Calculate duration from timestamps
 */
export function calculateDurationFromTimestamps(startTime, endTime) {
  if (!startTime || !endTime) return null;
  
  try {
    const startDate = new Date(startTime);
    const endDate = new Date(endTime);
    
    if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
      // Calculate duration in seconds
      const duration = Math.floor((endDate.getTime() - startDate.getTime()) / 1000);
      console.log(`Calculated duration from timestamps: ${duration}s (${startTime} to ${endTime})`);
      return duration;
    }
  } catch (err) {
    console.error(`Error calculating duration from timestamps:`, err);
  }
  
  return null;
}

/**
 * Normalize duration value
 */
export function normalizeDuration(duration) {
  if (duration === undefined || duration === null) return null;

  // Try to convert to number if it's a string
  if (typeof duration === 'string') {
    duration = parseInt(duration, 10);
    // Check if valid number after parsing
    if (isNaN(duration)) return null;
  } else if (typeof duration !== 'number') {
    return null;
  }
  
  // If duration seems to be in milliseconds (very large number), convert to seconds
  if (duration > 100000) {
    duration = Math.floor(duration / 1000);
    console.log(`Converted duration from milliseconds to seconds: ${duration}s`);
  }
  
  return duration;
}
