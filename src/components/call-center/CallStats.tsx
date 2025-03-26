
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
      color: "from-purple-100 to-purple-200",
      textColor: "text-purple-800"
    },
    {
      title: "Llamadas Hoy",
      value: totalCalls,
      icon: <PhoneCall className="h-5 w-5 text-white" />,
      description: "Llamadas realizadas hoy",
      color: "from-blue-100 to-blue-200",
      textColor: "text-blue-800"
    },
    {
      title: "Contactados",
      value: contactedCalls,
      icon: <CheckCircle className="h-5 w-5 text-white" />,
      description: "Leads contactados hoy",
      color: "from-green-100 to-green-200",
      textColor: "text-green-800"
    },
    {
      title: "Tasa de Contacto",
      value: `${contactRate}%`,
      icon: <Clock className="h-5 w-5 text-white" />,
      description: "Porcentaje de éxito",
      color: "from-yellow-100 to-yellow-200",
      textColor: "text-yellow-800"
    }
  ];

  return (
    <div className="space-y-4">
      <Card className="border shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Rendimiento</CardTitle>
          <CardDescription>Estadísticas de llamadas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4">
            {statsCards.map((stat, index) => (
              <div 
                key={index} 
                className={`p-4 rounded-lg bg-gradient-to-br ${stat.color} shadow-sm border border-gray-100`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className={`text-sm ${stat.textColor}`}>{stat.title}</p>
                    <p className={`text-2xl font-bold ${stat.textColor}`}>{stat.value}</p>
                  </div>
                  <div className={`bg-${stat.textColor.split('-')[1]}-500 p-2 rounded-full`}>
                    {stat.icon}
                  </div>
                </div>
                <p className={`text-xs ${stat.textColor} mt-2`}>{stat.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card className="border shadow-sm">
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
                    <span className="text-sm text-gray-600">{result}</span>
                    <span className="text-sm font-medium text-gray-800">{count} ({percentage}%)</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        result === "Contactado" ? "bg-green-500" :
                        result === "No contestó" ? "bg-yellow-500" :
                        result === "Buzón de voz" ? "bg-blue-500" :
                        result === "Número equivocado" ? "bg-red-500" :
                        "bg-purple-500"
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
