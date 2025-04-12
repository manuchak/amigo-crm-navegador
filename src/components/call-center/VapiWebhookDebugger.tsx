
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Loader2, Bug, AlertTriangle, CheckCircle, Copy } from 'lucide-react';
import { vapiWebhookUtils } from '@/hooks/lead-call-logs/vapiWebhookUtils';
import { toast } from 'sonner';

const VapiWebhookDebugger: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [callId, setCallId] = useState('');
  const [testResult, setTestResult] = useState<any>(null);
  const [success, setSuccess] = useState<boolean | null>(null);
  const [webhookUrl, setWebhookUrl] = useState<string>('');

  // Get webhook URL on mount
  React.useEffect(() => {
    const url = vapiWebhookUtils.getVapiWebhookUrl();
    setWebhookUrl(url);
  }, []);

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

  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bug className="h-5 w-5 text-amber-500" />
          VAPI Webhook Debugger
        </CardTitle>
        <CardDescription>
          Test webhook connection and manually process call logs
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Webhook URL</Label>
          <div className="flex items-center space-x-2">
            <Input
              value={webhookUrl}
              readOnly
              className="font-mono text-sm"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={copyWebhookUrl}
              title="Copy webhook URL"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Use this URL to configure the webhook in VAPI dashboard
          </p>
        </div>
        
        <Separator />
        
        <div className="space-y-2">
          <Label>Test Webhook Connection</Label>
          <Button 
            onClick={handleTestConnection}
            disabled={loading}
            className="w-full"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Test Connection
          </Button>
        </div>
        
        <Separator />
        
        <div className="space-y-2">
          <Label htmlFor="callId">Process Specific Call</Label>
          <div className="flex items-center space-x-2">
            <Input
              id="callId"
              placeholder="Enter VAPI call ID"
              value={callId}
              onChange={(e) => setCallId(e.target.value)}
              disabled={loading}
            />
            <Button 
              onClick={handleProcessCall}
              disabled={loading || !callId.trim()}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Process
            </Button>
          </div>
        </div>
        
        {testResult && (
          <>
            <Separator />
            
            {success === true ? (
              <Alert className="bg-green-50 border-green-500">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertTitle className="text-green-800">Success</AlertTitle>
                <AlertDescription className="text-green-700">
                  {testResult.message || 'Operation completed successfully'}
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  {testResult.error || testResult.message || 'An unknown error occurred'}
                </AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label>Response Details</Label>
              <Textarea
                value={JSON.stringify(testResult, null, 2)}
                readOnly
                className="h-48 font-mono text-xs"
              />
            </div>
          </>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <p className="text-xs text-muted-foreground">
          Use this tool to debug webhook issues with the VAPI integration
        </p>
      </CardFooter>
    </Card>
  );
};

export default VapiWebhookDebugger;
