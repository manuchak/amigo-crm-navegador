
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, AlertTriangle } from 'lucide-react';

interface ResultDisplayProps {
  testResult: any;
  success: boolean | null;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ testResult, success }) => {
  if (!testResult) return null;

  return (
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
  );
};

export default ResultDisplay;
