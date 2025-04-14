
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
    if (!callId.trim()) {
      toast.error('Please enter a call ID');
      return;
    }
    
    setLoading(true);
    setTestResult(null);
    setSuccess(null);
    
    try {
      console.log("Processing call with ID:", callId, "using API key:", showApiKey);
      const result = await vapiWebhookUtils.triggerManualWebhookProcessing(callId, showApiKey);
      setSuccess(result.success);
      
      if (result.success) {
        setTestResult(result.data);
        toast.success('Call processed successfully');
      } else {
        setTestResult({
          error: result.error,
          timestamp: new Date().toISOString(),
          type: 'error',
          apiKeyIncluded: showApiKey
        });
        toast.error(`Failed to process call: ${result.error}`);
      }
    } catch (error: any) {
      setSuccess(false);
      setTestResult({
        error: error.message,
        timestamp: new Date().toISOString(),
        type: 'error',
        apiKeyIncluded: showApiKey
      });
      toast.error(`Error processing call: ${error.message}`);
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
    copyWebhookUrl,
    toggleApiKey
  };
};
