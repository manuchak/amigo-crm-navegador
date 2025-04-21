
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { FileText } from 'lucide-react';
import DateFormatter from './DateFormatter';

interface CallInfoProps {
  callCount?: number | null;
  lastCallDate?: string | null;
  hasInterviewData: boolean;
}

const CallInfo: React.FC<CallInfoProps> = ({ callCount, lastCallDate, hasInterviewData }) => {
  if (callCount) {
    return (
      <div>
        <Badge variant="outline">{callCount}</Badge>
        {lastCallDate && (
          <div className="text-xs text-slate-500 mt-1">
            Última: <DateFormatter dateString={lastCallDate} />
          </div>
        )}
        
        {hasInterviewData && (
          <Badge variant="outline" className="mt-1 bg-green-50 text-green-600 border-green-200">
            <FileText className="h-3 w-3 mr-1" /> Entrevista
          </Badge>
        )}
      </div>
    );
  }
  
  return <span className="text-slate-400">Sin llamadas</span>;
};

export default CallInfo;
