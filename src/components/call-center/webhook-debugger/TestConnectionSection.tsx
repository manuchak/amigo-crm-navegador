
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface TestConnectionSectionProps {
  loading: boolean;
  onTest: () => void;
}

const TestConnectionSection: React.FC<TestConnectionSectionProps> = ({ loading, onTest }) => {
  return (
    <>
      <Separator />
      <div className="space-y-2">
        <Label>Test Webhook Connection</Label>
        <Button 
          onClick={onTest}
          disabled={loading}
          className="w-full"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Test Connection
        </Button>
      </div>
    </>
  );
};

export default TestConnectionSection;
