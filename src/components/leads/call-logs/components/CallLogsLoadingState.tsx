
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const CallLogsLoadingState: React.FC = () => {
  return (
    <div className="space-y-2 p-4">
      {Array(3).fill(null).map((_, i) => (
        <Skeleton key={i} className="h-20 w-full" />
      ))}
    </div>
  );
};
