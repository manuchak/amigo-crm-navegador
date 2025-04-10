/**
 * Configuration for VAPI integration
 */
export const CONFIG = {
  DEFAULT_API_KEY: '4e1d9a9c-de28-4e68-926c-3b5ca5a3ecb9',
  VAPI_ASSISTANT_ID: '0b7c2a96-0360-4fef-9956-e847fd696ea2',
  API_ENDPOINTS: [
    {
      url: 'https://api.vapi.ai/call/logs',
      method: 'GET',
      description: 'New VAPI call logs endpoint',
      supportsDates: false
    },
    {
      url: 'https://api.vapi.ai/call',
      method: 'GET',
      description: 'Primary calls endpoint',
      supportsDates: false
    },
    {
      url: 'https://api.vapi.ai/calls',
      method: 'GET',
      description: 'Alternative calls endpoint',
      supportsDates: false
    },
    {
      url: 'https://api.vapi.ai/call-logs',
      method: 'GET',
      description: 'Call logs endpoint',
      supportsDates: false
    },
    {
      url: 'https://api.vapi.ai/phone-number',
      method: 'GET',
      description: 'Phone numbers endpoint',
      supportsDates: false
    }
  ],
  // Mapping configuration to match VAPI API fields to Supabase columns
  FIELD_MAPPING: {
    // Standard VAPI API fields based on their documentation
    customerNumber: 'customer_number', 
    callerNumber: 'caller_phone_number',
    phoneNumber: 'phone_number',
    number: 'phone_number',
    duration: 'duration',
    // Other possible field variations from VAPI API
    customer_phone_number: 'customer_number',
    caller_phone: 'caller_phone_number',
    to_number: 'customer_number',
    from_number: 'caller_phone_number',
    // Additional field mappings for customer numbers
    to: 'customer_number',
    recipient: 'customer_number',
    receiverNumber: 'customer_number',
    receiver: 'customer_number',
    toNumber: 'customer_number',
    recipientNumber: 'customer_number',
    // Phone number field from the documentation
    fallbackDestination: {
      number: 'customer_number'
    }
  },
  // Metadata fields to request explicitly when calling VAPI API
  METADATA_REQUEST_FIELDS: [
    'phoneNumber',
    'customerNumber',
    'callerNumber',
    'customerPhoneNumber',
    'recipientNumber',
    'toNumber',
    'number'
  ]
};
