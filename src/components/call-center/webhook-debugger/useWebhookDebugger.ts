
import { useState, useEffect } from 'react';
import { vapiWebhookUtils } from '@/hooks/lead-call-logs/vapiWebhookUtils';
import { toast } from 'sonner';

export const useWebhookDebugger = () => {
  const [loading, setLoading] = useState(false);
  const [callId, setCallId] = useState('');
  const [testResult, setTestResult] = useState<any>(null);
  const [success, setSuccess] = useState<boolean | null>(null);
  const [webhookUrl, setWebhookUrl] = useState<string>('');
  const [showApiKey, setShowApiKey] = useState<boolean>(true);

  // Update webhook URL when showApiKey changes
  useEffect(() => {
    const url = vapiWebhookUtils.getVapiWebhookUrl(showApiKey);
    setWebhookUrl(url);
  }, [showApiKey]);

  const handleTestConnection = async () => {
    setLoading(true);
    setTestResult(null);
    setSuccess(null);
    
    try {
      console.log("Testing webhook connection with API key:", showApiKey);
      const result = await vapiWebhookUtils.testWebhookConnection(showApiKey);
      setSuccess(result.success);
      setTestResult({
        message: result.message,
        timestamp: new Date().toISOString(),
        type: 'connection_test',
        apiKeyIncluded: showApiKey
      });
      
      if (result.success) {
        toast.success('Webhook connection test successful');
      } else {
        toast.error(`Webhook test failed: ${result.message}`);
      }
    } catch (error: any) {
      setSuccess(false);
      setTestResult({
        error: error.message,
        timestamp: new Date().toISOString(),
        type: 'error',
        apiKeyIncluded: showApiKey
      });
      toast.error(`Error testing webhook: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessCall = async () => {
    // Allow empty call ID for testing the new flexible webhook functionality
    if (!callId.trim()) {
      const confirmed = window.confirm('You are about to test the webhook with no call ID. This is useful for testing if VAPI sends data without a call ID. Continue?');
      if (!confirmed) return;
    }
    
    setLoading(true);
    setTestResult(null);
    setSuccess(null);
    
    try {
      console.log("Processing call with ID:", callId || "NO_ID", "using API key:", showApiKey);
      const result = await vapiWebhookUtils.triggerManualWebhookProcessing(callId, showApiKey);
      setSuccess(result.success);
      
      if (result.success) {
        setTestResult(result.data);
        toast.success(callId.trim() ? 'Call processed successfully' : 'Webhook test without call ID successful');
      } else {
        setTestResult({
          error: result.error,
          timestamp: new Date().toISOString(),
          type: 'error',
          apiKeyIncluded: showApiKey
        });
        toast.error(`Failed to process: ${result.error}`);
      }
    } catch (error: any) {
      setSuccess(false);
      setTestResult({
        error: error.message,
        timestamp: new Date().toISOString(),
        type: 'error',
        apiKeyIncluded: showApiKey
      });
      toast.error(`Error processing: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSendTestData = async () => {
    setLoading(true);
    setTestResult(null);
    setSuccess(null);
    
    try {
      console.log("Sending test lead data to webhook");
      const result = await vapiWebhookUtils.sendTestLeadData(showApiKey);
      setSuccess(result.success);
      
      if (result.success) {
        setTestResult(result.data);
        toast.success('Test lead data processed successfully');
      } else {
        setTestResult({
          error: result.error,
          timestamp: new Date().toISOString(),
          type: 'error',
          apiKeyIncluded: showApiKey
        });
        toast.error(`Failed to process test data: ${result.error}`);
      }
    } catch (error: any) {
      setSuccess(false);
      setTestResult({
        error: error.message,
        timestamp: new Date().toISOString(),
        type: 'error',
        apiKeyIncluded: showApiKey
      });
      toast.error(`Error sending test data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const copyWebhookUrl = () => {
    navigator.clipboard.writeText(webhookUrl)
      .then(() => toast.success('Webhook URL copied to clipboard'))
      .catch(() => toast.error('Failed to copy webhook URL'));
  };
  
  const toggleApiKey = (show: boolean) => {
    setShowApiKey(show);
  };

  return {
    loading,
    callId,
    setCallId,
    testResult,
    success,
    webhookUrl,
    showApiKey,
    handleTestConnection,
    handleProcessCall,
    handleSendTestData,
    copyWebhookUrl,
    toggleApiKey
  };
};
