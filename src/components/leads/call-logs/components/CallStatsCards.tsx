
import React, { useMemo } from 'react';
import { VapiCallLog } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCallDuration } from '@/components/shared/call-logs/utils';
import { PhoneCall, Clock, PhoneIncoming, PhoneOutgoing } from 'lucide-react';

interface CallStatsCardsProps {
  callLogs: VapiCallLog[];
}

export const CallStatsCards: React.FC<CallStatsCardsProps> = ({ callLogs }) => {
  const stats = useMemo(() => {
    const totalCalls = callLogs.length;
    
    const totalDuration = callLogs.reduce((acc, log) => acc + (log.duration || 0), 0);
    const avgDuration = totalCalls > 0 ? Math.floor(totalDuration / totalCalls) : 0;
    
    const inboundCalls = callLogs.filter(log => log.direction === 'inbound').length;
    const outboundCalls = callLogs.filter(log => log.direction === 'outbound').length;
    
    // Count calls by status
    const statusCounts = callLogs.reduce((acc: Record<string, number>, log) => {
      const status = log.status || 'unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    
    return {
      totalCalls,
      totalDuration,
      avgDuration,
      inboundCalls,
      outboundCalls,
      completedCalls: statusCounts.completed || 0,
      failedCalls: statusCounts.failed || 0
    };
  }, [callLogs]);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Llamadas</CardTitle>
          <PhoneCall className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalCalls}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tiempo Total</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCallDuration(stats.totalDuration)}</div>
          <p className="text-xs text-muted-foreground">
            Promedio: {formatCallDuration(stats.avgDuration)} por llamada
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Llamadas Entrantes</CardTitle>
          <PhoneIncoming className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.inboundCalls}</div>
          <p className="text-xs text-muted-foreground">
            {stats.totalCalls > 0 
              ? `${Math.round((stats.inboundCalls / stats.totalCalls) * 100)}% del total` 
              : '0% del total'}
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Llamadas Salientes</CardTitle>
          <PhoneOutgoing className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.outboundCalls}</div>
          <p className="text-xs text-muted-foreground">
            {stats.totalCalls > 0 
              ? `${Math.round((stats.outboundCalls / stats.totalCalls) * 100)}% del total` 
              : '0% del total'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
