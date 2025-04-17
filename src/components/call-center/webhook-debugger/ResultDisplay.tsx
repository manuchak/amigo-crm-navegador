
import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle, Database } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

interface ResultDisplayProps {
  testResult: any;
  success: boolean | null;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ testResult, success }) => {
  if (!testResult) return null;

  // Check if data was saved in the database
  const savedInDatabase = testResult.saved_record || 
                         (testResult.data && testResult.data.saved_record) ||
                         (testResult.data && testResult.data.validated_lead_id);

  return (
    <>
      <Separator />
      
      {success === true ? (
        <Alert className="bg-green-50 border-green-500">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertTitle className="text-green-800">Success</AlertTitle>
          <AlertDescription className="text-green-700">
            {testResult.message || 'Operation completed successfully'}
            {savedInDatabase && (
              <div className="mt-2">
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                  <Database className="h-3 w-3 mr-1" /> 
                  Data saved in validated_leads table
                </Badge>
              </div>
            )}
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
