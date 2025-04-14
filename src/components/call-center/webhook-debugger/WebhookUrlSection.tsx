
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';

interface WebhookUrlSectionProps {
  webhookUrl: string;
  onCopy: () => void;
  showApiKey: boolean;
  onToggleApiKey: (show: boolean) => void;
}

const WebhookUrlSection: React.FC<WebhookUrlSectionProps> = ({ 
  webhookUrl, 
  onCopy, 
  showApiKey, 
  onToggleApiKey 
}) => {
  return (
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
          onClick={onCopy}
          title="Copy webhook URL"
        >
          <Copy className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex items-center space-x-2 mt-2">
        <Switch 
          id="api-key-switch"
          checked={showApiKey}
          onCheckedChange={onToggleApiKey}
        />
        <Label htmlFor="api-key-switch" className="text-xs">
          Include API key in URL (required for external services)
        </Label>
      </div>
      
      <p className="text-xs text-muted-foreground">
        Use this URL to configure the webhook in VAPI dashboard
      </p>
      
      <Separator className="my-4" />
    </div>
  );
};

export default WebhookUrlSection;
