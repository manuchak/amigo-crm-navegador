
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Clock, PhoneForwarded } from 'lucide-react';
import { CallRecord } from './types';

interface CallStatsProps {
  leads: { id: number; nombre: string; empresa: string; contacto: string; estado: string; fechaCreacion: string }[];
  callsForToday: CallRecord[];
}

const CallStats: React.FC<CallStatsProps> = ({ leads, callsForToday }) => {
  // Calculamos algunas estadísticas
  const totalLeads = leads.length;
  const contactados = leads.filter(lead => lead.estado === "Contactado").length;
  const porcentajeContactados = totalLeads > 0 ? (contactados / totalLeads) * 100 : 0;
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-xl">Estadísticas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm">Leads contactados</span>
            <span className="text-sm font-medium">{contactados}/{totalLeads}</span>
          </div>
          <Progress value={porcentajeContactados} className="h-2" />
        </div>
        
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm">Llamadas de hoy</span>
            <span className="text-sm font-medium">{callsForToday.length}</span>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-muted/30 p-3 rounded-md text-center">
              <div className="font-medium text-2xl">
                {callsForToday.filter(c => c.resultado === "Contactado").length}
              </div>
              <div className="text-xs text-muted-foreground">Contactados</div>
            </div>
            <div className="bg-muted/30 p-3 rounded-md text-center">
              <div className="font-medium text-2xl">
                {callsForToday.filter(c => c.resultado !== "Contactado").length}
              </div>
              <div className="text-xs text-muted-foreground">No contactados</div>
            </div>
          </div>
        </div>
        
        <div className="border-t pt-4">
          <h4 className="font-medium mb-2">Próximas llamadas programadas</h4>
          {callsForToday.filter(c => c.resultado === "Programada").length === 0 ? (
            <div className="text-sm text-muted-foreground">No hay llamadas programadas</div>
          ) : (
            <div className="space-y-2">
              {callsForToday
                .filter(c => c.resultado === "Programada")
                .map(call => (
                  <div key={call.id} className="flex items-center justify-between bg-secondary/50 p-2 rounded-md">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">{call.nombreLead}</span>
                    </div>
                    <Button size="sm" variant="ghost">
                      <PhoneForwarded className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CallStats;
