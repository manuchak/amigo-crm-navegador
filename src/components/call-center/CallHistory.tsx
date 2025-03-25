
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CallRecord } from './types';

interface CallHistoryProps {
  callsForToday: CallRecord[];
}

const CallHistory: React.FC<CallHistoryProps> = ({ callsForToday }) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-xl">Historial de Llamadas (Hoy)</CardTitle>
      </CardHeader>
      <CardContent>
        {callsForToday.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No hay llamadas registradas para hoy
          </div>
        ) : (
          <div className="rounded-md border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="h-10 px-4 text-left font-medium">Lead</th>
                  <th className="h-10 px-4 text-left font-medium">Hora</th>
                  <th className="h-10 px-4 text-left font-medium">Duración</th>
                  <th className="h-10 px-4 text-left font-medium">Resultado</th>
                  <th className="h-10 px-4 text-left font-medium">Notas</th>
                </tr>
              </thead>
              <tbody>
                {callsForToday.map((call, i) => (
                  <tr key={call.id} className={i % 2 === 0 ? "bg-white" : "bg-muted/20"}>
                    <td className="p-2 px-4">{call.nombreLead}</td>
                    <td className="p-2 px-4">{call.horaLlamada}</td>
                    <td className="p-2 px-4">{call.duracion}</td>
                    <td className="p-2 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        call.resultado === 'Contactado' ? 'bg-green-100 text-green-700' :
                        call.resultado === 'No contestó' ? 'bg-yellow-100 text-yellow-700' :
                        call.resultado === 'Buzón de voz' ? 'bg-blue-100 text-blue-700' :
                        call.resultado === 'Número equivocado' ? 'bg-red-100 text-red-700' :
                        'bg-purple-100 text-purple-700'
                      }`}>
                        {call.resultado}
                      </span>
                    </td>
                    <td className="p-2 px-4 max-w-[200px] truncate">{call.notas}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CallHistory;
