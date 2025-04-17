
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, Database } from 'lucide-react';
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
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Database className="h-4 w-4 mr-2" />}
            Send Test Data to Validated Leads
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Send a complete test lead to validate data storage in the validated_leads table
        </p>
      </div>
    </>
  );
};

export default TestDataSection;
