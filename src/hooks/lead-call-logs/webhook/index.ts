
import { webhookUrls } from './webhookUrls';
import { webhookRegistration } from './webhookRegistration';
import { webhookTesting } from './webhookTesting';
import { webhookProcessing } from './webhookProcessing';
import { webhookTestData } from './webhookTestData';

/**
 * Export the webhook utilities for use in components
 */
export const vapiWebhookUtils = {
  ...webhookUrls,
  ...webhookRegistration,
  ...webhookTesting,
  ...webhookProcessing,
  ...webhookTestData
};
