
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Bug } from 'lucide-react';
import { useWebhookDebugger } from './useWebhookDebugger';
import WebhookUrlSection from './WebhookUrlSection';
import TestConnectionSection from './TestConnectionSection';
import ProcessCallSection from './ProcessCallSection';
import ResultDisplay from './ResultDisplay';

const VapiWebhookDebugger: React.FC = () => {
  const {
    loading,
    callId,
    setCallId,
    testResult,
    success,
    webhookUrl,
    handleTestConnection,
    handleProcessCall,
    copyWebhookUrl
  } = useWebhookDebugger();

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
        <WebhookUrlSection 
          webhookUrl={webhookUrl} 
          onCopy={copyWebhookUrl} 
        />
        
        <TestConnectionSection 
          loading={loading} 
          onTest={handleTestConnection} 
        />
        
        <ProcessCallSection 
          loading={loading}
          callId={callId}
          onCallIdChange={setCallId}
          onProcess={handleProcessCall}
        />
        
        {testResult && (
          <ResultDisplay 
            testResult={testResult}
            success={success}
          />
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
