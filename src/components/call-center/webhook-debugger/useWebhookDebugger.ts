
import { useState } from 'react';
import { vapiWebhookUtils } from '@/hooks/lead-call-logs/vapiWebhookUtils';
import { toast } from 'sonner';

export const useWebhookDebugger = () => {
  const [loading, setLoading] = useState(false);
  const [callId, setCallId] = useState('');
  const [testResult, setTestResult] = useState<any>(null);
  const [success, setSuccess] = useState<boolean | null>(null);
  const [webhookUrl, setWebhookUrl] = useState<string>('');

  // Get webhook URL on mount
  useState(() => {
    const url = vapiWebhookUtils.getVapiWebhookUrl();
    setWebhookUrl(url);
  });

  const handleTestConnection = async () => {
    setLoading(true);
    setTestResult(null);
    setSuccess(null);
    
    try {
      const result = await vapiWebhookUtils.testWebhookConnection();
      setSuccess(result.success);
      setTestResult({
        message: result.message,
        timestamp: new Date().toISOString(),
        type: 'connection_test'
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
        type: 'error'
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
      const result = await vapiWebhookUtils.triggerManualWebhookProcessing(callId);
      setSuccess(result.success);
      
      if (result.success) {
        setTestResult(result.data);
        toast.success('Call processed successfully');
      } else {
        setTestResult({
          error: result.error,
          timestamp: new Date().toISOString(),
          type: 'error'
        });
        toast.error(`Failed to process call: ${result.error}`);
      }
    } catch (error: any) {
      setSuccess(false);
      setTestResult({
        error: error.message,
        timestamp: new Date().toISOString(),
        type: 'error'
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

  return {
    loading,
    callId,
    setCallId,
    testResult,
    success,
    webhookUrl,
    handleTestConnection,
    handleProcessCall,
    copyWebhookUrl
  };
};
