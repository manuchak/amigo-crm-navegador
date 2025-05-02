
export const vapiWebhookUtils = {
  /**
   * Helper functions for processing webhook data
   * Can be expanded later as needed
   */
  parseWebhookData: (data: any): any => {
    try {
      return typeof data === 'string' ? JSON.parse(data) : data;
    } catch (e) {
      console.error('Error parsing webhook data:', e);
      return data;
    }
  }
};
