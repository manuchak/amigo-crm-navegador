
/**
 * Configuration for VAPI API
 */
export const CONFIG = {
  VAPI_ASSISTANT_ID: '0b7c2a96-0360-4fef-9956-e847fd696ea2',
  
  // API Endpoints to try for fetching logs
  API_ENDPOINTS: [
    {
      url: 'https://api.vapi.ai/assistant/logs',
      method: 'GET',
      description: 'Assistant logs endpoint',
      supportsDates: true
    },
    {
      url: 'https://api.vapi.ai/call',
      method: 'GET',
      description: 'Call detail endpoint',
      supportsDates: false
    },
    {
      url: 'https://api.vapi.ai/assistant/call-logs',
      method: 'GET',
      description: 'Call logs endpoint',
      supportsDates: true
    }
  ],
  
  // Field mapping for different API response formats
  FIELD_MAPPING: {
    'id': 'log_id',
    'assistant_id': 'assistant_id',
    'organization_id': 'organization_id',
    'conversation_id': 'conversation_id',
    'customer_number': 'customer_number',
    'caller_phone_number': 'caller_phone_number',
    'phone_number': 'phone_number',
    'start_time': 'start_time',
    'end_time': 'end_time',
    'duration': 'duration',
    'status': 'status',
    'direction': 'direction',
    'transcript': 'transcript',
    'recording_url': 'recording_url',
    'customer': 'customer'
  },
  
  // Metadata fields we want to explicitly request
  METADATA_REQUEST_FIELDS: [
    'customer',
    'customer.number',
    'customerNumber',
    'phoneNumber',
    'number'
  ]
};
