
import { parseWebhookData } from './webhookProcessing';
import { getVapiWebhookUrl, testWebhookConnection } from './webhookTesting';
import { triggerManualWebhookProcessing } from './webhookProcessing';
import { sendTestLeadData } from './webhookTestData';

export const vapiWebhookUtils = {
  parseWebhookData,
  getVapiWebhookUrl,
  testWebhookConnection,
  triggerManualWebhookProcessing,
  sendTestLeadData
};
