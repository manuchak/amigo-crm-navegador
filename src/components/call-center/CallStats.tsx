
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PhoneCall, User, CheckCircle, Clock } from 'lucide-react';

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

interface CallStatsProps {
  leads: any[];
  callsForToday: CallRecord[];
}

const CallStats: React.FC<CallStatsProps> = ({ leads, callsForToday }) => {
  // Cálculo de estadísticas
  const totalLeads = leads.length;
  const totalCalls = callsForToday.length;
  const contactedCalls = callsForToday.filter(call => call.resultado === "Contactado").length;
  const contactRate = totalCalls > 0 ? Math.round((contactedCalls / totalCalls) * 100) : 0;
  
  const statsCards = [
    {
      title: "Total Custodios",
      value: totalLeads,
      icon: <User className="h-5 w-5 text-white" />,
      description: "Total de leads en el sistema",
      color: "from-purple-800 to-purple-900"
    },
    {
      title: "Llamadas Hoy",
      value: totalCalls,
      icon: <PhoneCall className="h-5 w-5 text-white" />,
      description: "Llamadas realizadas hoy",
      color: "from-blue-800 to-blue-900"
    },
    {
      title: "Contactados",
      value: contactedCalls,
      icon: <CheckCircle className="h-5 w-5 text-white" />,
      description: "Leads contactados hoy",
      color: "from-green-800 to-green-900"
    },
    {
      title: "Tasa de Contacto",
      value: `${contactRate}%`,
      icon: <Clock className="h-5 w-5 text-white" />,
      description: "Porcentaje de éxito",
      color: "from-yellow-800 to-yellow-900"
    }
  ];

  return (
    <div className="space-y-4">
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Rendimiento</CardTitle>
          <CardDescription>Estadísticas de llamadas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4">
            {statsCards.map((stat, index) => (
              <div 
                key={index} 
                className={`p-4 rounded-lg bg-gradient-to-br ${stat.color} border border-white/10`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-300 text-sm">{stat.title}</p>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                  </div>
                  <div className="bg-black/20 p-2 rounded-full">
                    {stat.icon}
                  </div>
                </div>
                <p className="text-xs text-gray-300 mt-2">{stat.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Resultados de Llamadas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {["Contactado", "No contestó", "Buzón de voz", "Número equivocado", "Programada"].map(result => {
              const count = callsForToday.filter(call => call.resultado === result).length;
              const percentage = totalCalls > 0 ? Math.round((count / totalCalls) * 100) : 0;
              
              return (
                <div key={result} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-300">{result}</span>
                    <span className="text-sm font-medium text-white">{count} ({percentage}%)</span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        result === "Contactado" ? "bg-green-600" :
                        result === "No contestó" ? "bg-yellow-600" :
                        result === "Buzón de voz" ? "bg-blue-600" :
                        result === "Número equivocado" ? "bg-red-600" :
                        "bg-purple-600"
                      }`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CallStats;
