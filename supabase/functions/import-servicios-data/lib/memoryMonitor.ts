
// Simple memory monitor for Deno Edge Functions

/**
 * Initialize memory usage monitoring
 */
export function initializeMemoryUsageMonitoring(config = { threshold: 0.7, intervalMs: 10000 }): void {
  // Regular monitoring of memory usage
  const interval = setInterval(() => {
    const memoryInfo = reportMemoryUsage();
    
    // If memory usage exceeds threshold, force garbage collection
    if (memoryInfo.heapUsed / memoryInfo.heapTotal > config.threshold) {
      console.log(`Memory usage exceeds threshold (${Math.round(memoryInfo.heapUsed / memoryInfo.heapTotal * 100)}%), forcing garbage collection`);
      forceGarbageCollection();
    }
  }, config.intervalMs);
  
  // Clear interval when function ends
  addEventListener("beforeunload", () => clearInterval(interval));
}

/**
 * Report current memory usage
 */
export function reportMemoryUsage(label = ""): { rss: number; heapTotal: number; heapUsed: number; external: number } {
  try {
    // For Deno we'll create a compatible object with Node.js memory info structure
    const memoryInfo = {
      rss: 0,          // Not available in Deno
      heapTotal: 0,    // Not available directly
      heapUsed: 0,     // Not available directly
      external: 0      // Not available in Deno
    };
    
    // Log memory info
    console.log(`Memory usage${label ? ` (${label})` : ''}: Not fully available in Deno Edge Functions`);
    
    return memoryInfo;
  } catch (error) {
    console.error("Error reporting memory usage:", error);
    return {
      rss: 0,
      heapTotal: 1,  // Prevent divide by zero
      heapUsed: 0,
      external: 0
    };
  }
}

/**
 * Force garbage collection if possible
 */
export async function forceGarbageCollection(): Promise<void> {
  try {
    // In Deno Edge Functions, we can't force GC directly
    // We'll use a workaround to encourage garbage collection
    
    // Create and discard a large object to hint GC
    const largeArray = new Array(1000000);
    for (let i = 0; i < 1000000; i++) {
      largeArray[i] = i;
    }
    
    // Wait briefly to allow GC to potentially run
    await new Promise(resolve => setTimeout(resolve, 10));
    
    console.log("Attempted to encourage garbage collection");
  } catch (error) {
    console.error("Error during garbage collection attempt:", error);
  }
}
