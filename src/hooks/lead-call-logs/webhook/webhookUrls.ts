
/**
 * Webhook URL configurations
 */
export const webhookUrls = {
  /**
   * The Make.com webhook URL for lead data
   */
  LEADS_WEBHOOK_URL: "https://hook.us2.make.com/nlckmsej5cwmfe93gv4g6xvmavhilujl",
  
  /**
   * The Make.com webhook URL for batch calling leads
   */
  BATCH_WEBHOOK_URL: "https://hook.us2.make.com/invpt3dzdm99q4ddckvke8x1x47ic9io",
  
  /**
   * Name of the webhook integration
   */
  WEBHOOK_NAME: "Make.com Integration",
  
  /**
   * Format a URL for webhook testing
   * @param baseUrl The base URL of the webhook
   * @param action The action to test
   * @returns Formatted URL
   */
  formatTestUrl(baseUrl: string, action: string): string {
    return `${baseUrl}?test=true&action=${action}`;
  }
};
