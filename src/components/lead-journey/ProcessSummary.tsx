
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

export const ProcessSummary: React.FC = () => {
  // Dummy data for charts
  const statusData = [
    { name: 'Entrevista Inicial', value: 38 },
    { name: 'Validación', value: 22 },
    { name: 'Documentación', value: 15 },
    { name: 'Exámenes', value: 10 },
    { name: 'Pruebas de Campo', value: 8 },
    { name: 'Contratados', value: 7 }
  ];
  
  const colors = ['#818CF8', '#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981'];

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle>Resumen del Proceso</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-500 mb-6">
            Vista general del proceso de reclutamiento y estado de los candidatos.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Stats Card */}
            <div className="space-y-6">
              <div className="bg-white p-4 rounded-lg border border-slate-100">
                <h3 className="text-lg font-medium text-slate-800">Estado de los candidatos</h3>
                
                <div className="mt-4 space-y-4">
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-slate-700">Entrevista Inicial</span>
                      <span className="text-sm text-slate-500">38 candidatos</span>
                    </div>
                    <Progress value={38} className="h-2" />
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-slate-700">Validación</span>
                      <span className="text-sm text-slate-500">22 candidatos</span>
                    </div>
                    <Progress value={22} className="h-2" />
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-slate-700">Documentación</span>
                      <span className="text-sm text-slate-500">15 candidatos</span>
                    </div>
                    <Progress value={15} className="h-2" />
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-slate-700">Exámenes Psicométricos</span>
                      <span className="text-sm text-slate-500">10 candidatos</span>
                    </div>
                    <Progress value={10} className="h-2" />
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-slate-700">Pruebas de Campo</span>
                      <span className="text-sm text-slate-500">8 candidatos</span>
                    </div>
                    <Progress value={8} className="h-2" />
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-slate-700">Contratados</span>
                      <span className="text-sm text-slate-500">7 candidatos</span>
                    </div>
                    <Progress value={7} className="h-2" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-slate-100">
                <h3 className="text-lg font-medium text-slate-800">Distribución por tipo</h3>
                <div className="flex flex-wrap gap-3 mt-4">
                  <div className="flex items-center p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="mr-3">
                      <span className="block text-2xl font-bold text-blue-700">65%</span>
                      <span className="text-xs text-blue-600">42 candidatos</span>
                    </div>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200">
                      Custodio Armado
                    </Badge>
                  </div>
                  
                  <div className="flex items-center p-3 bg-green-50 rounded-lg border border-green-100">
                    <div className="mr-3">
                      <span className="block text-2xl font-bold text-green-700">35%</span>
                      <span className="text-xs text-green-600">23 candidatos</span>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200">
                      Custodio con Vehículo
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Chart Card */}
            <div className="bg-white p-4 rounded-lg border border-slate-100">
              <h3 className="text-lg font-medium text-slate-800">Distribución por etapa</h3>
              <div className="h-80 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      fill="#8884d8"
                      paddingAngle={2}
                      dataKey="value"
                      label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip formatter={(value) => [`${value} candidatos`, 'Cantidad']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
