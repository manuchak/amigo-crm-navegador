
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';

interface WebhookUrlSectionProps {
  webhookUrl: string;
  onCopy: () => void;
}

const WebhookUrlSection: React.FC<WebhookUrlSectionProps> = ({ webhookUrl, onCopy }) => {
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
      <p className="text-xs text-muted-foreground">
        Use this URL to configure the webhook in VAPI dashboard
      </p>
    </div>
  );
};

export default WebhookUrlSection;
