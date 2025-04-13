
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface ProcessCallSectionProps {
  loading: boolean;
  callId: string;
  onCallIdChange: (value: string) => void;
  onProcess: () => void;
}

const ProcessCallSection: React.FC<ProcessCallSectionProps> = ({ 
  loading, 
  callId, 
  onCallIdChange,
  onProcess 
}) => {
  return (
    <>
      <Separator />
      <div className="space-y-2">
        <Label htmlFor="callId">Process Specific Call</Label>
        <div className="flex items-center space-x-2">
          <Input
            id="callId"
            placeholder="Enter VAPI call ID"
            value={callId}
            onChange={(e) => onCallIdChange(e.target.value)}
            disabled={loading}
          />
          <Button 
            onClick={onProcess}
            disabled={loading || !callId.trim()}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Process
          </Button>
        </div>
      </div>
    </>
  );
};

export default ProcessCallSection;
