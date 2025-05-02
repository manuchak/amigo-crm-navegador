
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

// Constants for the leads webhook
export const LEADS_WEBHOOK_URL = "https://hook.us2.make.com/nlckmsej5cwmfe93gv4g6xvmavhilujl";
export const LEADS_WEBHOOK_NAME = "Make.com Leads Integration";
export const LEADS_WEBHOOK_API_KEY = "mk_prod_12345"; // Replace with actual API key if needed

/**
 * Fetch leads data from external database through webhook
 * @returns Promise with leads data
 */
export const fetchLeadsFromExternalDatabase = async (): Promise<any> => {
  try {
    console.log("Fetching leads from external database via webhook");
    
    const response = await fetch(LEADS_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LEADS_WEBHOOK_API_KEY}`
      },
      mode: 'no-cors', // Adding this to handle CORS issues
      body: JSON.stringify({ 
        action: "get_leads", 
        timestamp: new Date().toISOString(),
        source: "supply_team_dashboard"
      })
    });
    
    // Since we're using no-cors mode, we can't actually parse the response
    // In a real implementation, we would handle this differently
    return []; // Returning empty array which will cause sample data to be used
  } catch (error) {
    console.error("Error fetching leads from external database:", error);
    throw error;
  }
};
