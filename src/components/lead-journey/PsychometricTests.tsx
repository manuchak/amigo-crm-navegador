
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileCheck, Search, Clock, CalendarDays } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export const PsychometricTests: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle>Exámenes Psicométricos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-500 mb-6">
            Evaluación psicológica y aptitudinal para determinar si el candidato es apto para el puesto.
          </p>
          
          <div className="space-y-6">
            {/* Test Types */}
            <div className="bg-pink-50 rounded-lg p-4 border border-pink-100">
              <h3 className="text-pink-800 font-medium">Tipos de pruebas</h3>
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex flex-col p-3 bg-white rounded-lg border border-slate-100">
                  <h4 className="font-medium text-slate-800">Evaluación de personalidad</h4>
                  <p className="text-xs text-slate-500 mt-1">Evalúa rasgos de personalidad, estabilidad emocional y comportamiento social</p>
                  <Badge className="mt-2 w-fit bg-blue-100 text-blue-800 hover:bg-blue-200">60-90 minutos</Badge>
                </div>
                <div className="flex flex-col p-3 bg-white rounded-lg border border-slate-100">
                  <h4 className="font-medium text-slate-800">Evaluación de aptitudes cognitivas</h4>
                  <p className="text-xs text-slate-500 mt-1">Mide razonamiento lógico, atención y resolución de problemas</p>
                  <Badge className="mt-2 w-fit bg-blue-100 text-blue-800 hover:bg-blue-200">45-60 minutos</Badge>
                </div>
                <div className="flex flex-col p-3 bg-white rounded-lg border border-slate-100">
                  <h4 className="font-medium text-slate-800">Evaluación de estrés</h4>
                  <p className="text-xs text-slate-500 mt-1">Evalúa capacidad para trabajar bajo presión y manejar situaciones estresantes</p>
                  <Badge className="mt-2 w-fit bg-blue-100 text-blue-800 hover:bg-blue-200">30-45 minutos</Badge>
                </div>
                <div className="flex flex-col p-3 bg-white rounded-lg border border-slate-100">
                  <h4 className="font-medium text-slate-800">Pruebas de integridad</h4>
                  <p className="text-xs text-slate-500 mt-1">Evalúa honestidad, ética de trabajo y probabilidad de comportamientos riesgosos</p>
                  <Badge className="mt-2 w-fit bg-blue-100 text-blue-800 hover:bg-blue-200">45-60 minutos</Badge>
                </div>
              </div>
            </div>
            
            {/* Candidates List */}
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-slate-50 p-3 border-b">
                <h3 className="font-medium text-slate-700">Candidatos en proceso</h3>
              </div>
              <div className="divide-y">
                {/* Candidate Row */}
                <div className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="w-full max-w-lg">
                      <h4 className="font-medium text-slate-800">José Ramírez</h4>
                      <div className="text-sm text-slate-500 mt-1">Ex-policía estatal</div>
                      
                      <div className="mt-3 flex items-center gap-2">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200">
                          Custodio Armado
                        </Badge>
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200">
                          <Clock className="h-3 w-3 mr-1" />
                          Programado
                        </Badge>
                      </div>
                      
                      {/* Test Schedule */}
                      <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center">
                        <CalendarDays className="h-5 w-5 text-slate-500 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-slate-700">Fecha programada: 15 de mayo, 2023</p>
                          <p className="text-xs text-slate-500">10:00 AM - Centro de evaluación</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="h-8 gap-1">
                        <Search className="h-3.5 w-3.5" />
                        <span>Ver Detalles</span>
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Candidate with tests in progress */}
                <div className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="w-full max-w-lg">
                      <h4 className="font-medium text-slate-800">Luis Hernández</h4>
                      <div className="text-sm text-slate-500 mt-1">Ex-taxista con 8 años de experiencia</div>
                      
                      <div className="mt-3 flex items-center gap-2">
                        <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200">
                          Custodio con Vehículo
                        </Badge>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200">
                          En Proceso
                        </Badge>
                      </div>
                      
                      {/* Test Progress */}
                      <div className="mt-4 space-y-3">
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-xs text-slate-600">
                            <span>Evaluación de personalidad</span>
                            <span>Completado</span>
                          </div>
                          <Progress value={100} className="h-1" />
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-xs text-slate-600">
                            <span>Evaluación de aptitudes cognitivas</span>
                            <span>Completado</span>
                          </div>
                          <Progress value={100} className="h-1" />
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-xs text-slate-600">
                            <span>Evaluación de estrés</span>
                            <span>En progreso</span>
                          </div>
                          <Progress value={60} className="h-1" />
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-xs text-slate-600">
                            <span>Pruebas de integridad</span>
                            <span>Pendiente</span>
                          </div>
                          <Progress value={0} className="h-1" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="h-8 gap-1">
                        <Search className="h-3.5 w-3.5" />
                        <span>Ver Detalles</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
