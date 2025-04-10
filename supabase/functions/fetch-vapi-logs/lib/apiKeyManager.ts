
import { CONFIG } from './config.ts';

/**
 * API Key Management Module
 */
export class ApiKeyManager {
  /**
   * Fetch the VAPI API key from the database
   */
  static async getApiKey(supabase) {
    console.log('Fetching VAPI API key from database')
    try {
      const { data: secretData, error: secretError } = await supabase
        .from('secrets')
        .select('value')
        .eq('name', 'VAPI_API_KEY')
        .maybeSingle()
      
      if (secretError) {
        console.error('Error fetching VAPI API key from database:', secretError)
        throw new Error('Failed to fetch API key from database')
      }
      
      // If API key is not found in database, use the default one
      let apiKey = secretData?.value
      
      if (!apiKey) {
        console.log('VAPI API key not found in database, using default key')
        apiKey = CONFIG.DEFAULT_API_KEY
        
        // Try to store the default key in the database for future use
        try {
          await supabase.from('secrets').insert([
            { name: 'VAPI_API_KEY', value: apiKey }
          ])
          console.log('Default VAPI API key stored in database')
        } catch (storeError) {
          // Continue even if storing fails
          console.error('Failed to store default VAPI API key:', storeError)
        }
      }

      return apiKey
    } catch (error) {
      console.error('Error in getApiKey:', error)
      // Fall back to default key on error
      return CONFIG.DEFAULT_API_KEY
    }
  }
}
