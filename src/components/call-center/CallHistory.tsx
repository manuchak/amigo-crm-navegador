
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CallRecord {
  id: number;
  leadId: number;
  nombreLead: string;
  fechaLlamada: string;
  horaLlamada: string;
  duracion: string;
  resultado: "Contactado" | "No contestó" | "Buzón de voz" | "Número equivocado" | "Programada";
  notas: string;
}

interface CallHistoryProps {
  callsForToday: CallRecord[];
}

const CallHistory: React.FC<CallHistoryProps> = ({ callsForToday }) => {
  const getResultColor = (result: string): string => {
    switch (result) {
      case "Contactado": return "success";
      case "No contestó": return "warning";
      case "Buzón de voz": return "info";
      case "Número equivocado": return "destructive";
      case "Programada": return "purple";
      default: return "secondary";
    }
  };

  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardHeader>
        <CardTitle className="text-xl">Historial de Llamadas ({callsForToday.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {callsForToday.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No hay llamadas registradas hoy
          </div>
        ) : (
          <ScrollArea className="h-[300px]">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-800/50 hover:bg-gray-800/70">
                  <TableHead>Custodio</TableHead>
                  <TableHead>Hora</TableHead>
                  <TableHead>Duración</TableHead>
                  <TableHead>Resultado</TableHead>
                  <TableHead>Notas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {callsForToday.map((call) => (
                  <TableRow key={call.id} className="hover:bg-gray-800/50">
                    <TableCell className="font-medium">{call.nombreLead}</TableCell>
                    <TableCell>{call.horaLlamada}</TableCell>
                    <TableCell>{call.duracion}</TableCell>
                    <TableCell>
                      <Badge variant={getResultColor(call.resultado)}>
                        {call.resultado}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">{call.notas}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default CallHistory;
