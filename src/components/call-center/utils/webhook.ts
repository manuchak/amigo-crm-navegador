
/**
 * Execute a webhook with data
 * @param data The data to send to the webhook
 */
export const executeWebhook = async (data: any): Promise<void> => {
  try {
    // Use the Make.com webhook URL
    const webhookUrl = "https://hook.us2.make.com/nlckmsej5cwmfe93gv4g6xvmavhilujl";
    
    // Add timestamp if not present
    const payload = {
      ...data,
      timestamp: data.timestamp || new Date().toISOString(),
    };
    
    console.log(`Executing webhook with data:`, payload);
    
    // POST to webhook
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      throw new Error(`Webhook error: ${response.status}`);
    }
    
    console.log('Webhook executed successfully');
  } catch (error) {
    console.error('Error executing webhook:', error);
  }
};
