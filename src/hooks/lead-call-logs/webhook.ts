
import { webhookUrls } from './webhook/webhookUrls';
import { webhookRegistration } from './webhook/webhookRegistration';
import { webhookTesting } from './webhook/webhookTesting';
import { webhookProcessing } from './webhook/webhookProcessing';
import { webhookTestData } from './webhook/webhookTestData';
import { webhookCalls } from './webhook/webhookCalls';

/**
 * Export the webhook utilities for use in components
 */
export const vapiWebhookUtils = {
  ...webhookUrls,
  ...webhookRegistration,
  ...webhookTesting,
  ...webhookProcessing,
  ...webhookTestData,
  ...webhookCalls,

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
