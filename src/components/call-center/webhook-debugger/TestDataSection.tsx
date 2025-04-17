
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface TestDataSectionProps {
  onSendTestData: () => void;
  loading: boolean;
}

const TestDataSection: React.FC<TestDataSectionProps> = ({ 
  onSendTestData, 
  loading 
}) => {
  return (
    <>
      <Separator />
      <div className="space-y-2">
        <Label>Send Test Lead Data</Label>
        <div className="flex items-center space-x-2">
          <Button 
            onClick={onSendTestData}
            disabled={loading}
            className="w-full"
            variant="outline"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Send Sample Lead Data
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Send a sample lead with complete data to test the full validation workflow
        </p>
      </div>
    </>
  );
};

export default TestDataSection;
