
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Shield, Calendar, Clock, Check, X } from 'lucide-react';

export const FieldTests: React.FC = () => {
  const [activeTab, setActiveTab] = useState("armed");
  
  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle>Pruebas de Campo</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-500 mb-6">
            Evaluación práctica de habilidades específicas según el tipo de custodio.
          </p>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="armed">Evaluación de Seguridad y Manejo de Armas</TabsTrigger>
              <TabsTrigger value="vehicle">Evaluación de Conducción</TabsTrigger>
            </TabsList>
            
            <TabsContent value="armed" className="animate-fade-in">
              <div className="space-y-6">
                <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
                  <h3 className="text-amber-800 font-medium">Habilidades evaluadas</h3>
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex flex-col p-3 bg-white rounded-lg border border-slate-100">
                      <h4 className="font-medium text-slate-800">Manejo seguro de armas</h4>
                      <p className="text-xs text-slate-500 mt-1">Evaluación de protocolos de seguridad y manejo técnico</p>
                    </div>
                    <div className="flex flex-col p-3 bg-white rounded-lg border border-slate-100">
                      <h4 className="font-medium text-slate-800">Precisión y puntería</h4>
                      <p className="text-xs text-slate-500 mt-1">Pruebas en campo de tiro bajo diferentes condiciones</p>
                    </div>
                    <div className="flex flex-col p-3 bg-white rounded-lg border border-slate-100">
                      <h4 className="font-medium text-slate-800">Respuesta táctica</h4>
                      <p className="text-xs text-slate-500 mt-1">Evaluación de respuesta a situaciones de emergencia</p>
                    </div>
                    <div className="flex flex-col p-3 bg-white rounded-lg border border-slate-100">
                      <h4 className="font-medium text-slate-800">Conocimiento técnico</h4>
                      <p className="text-xs text-slate-500 mt-1">Conocimiento sobre tipos de armas, mantenimiento y normativas</p>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-slate-50 p-3 border-b">
                    <h3 className="font-medium text-slate-700">Candidatos para evaluación</h3>
                  </div>
                  <div className="divide-y">
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
                              <Calendar className="h-3 w-3 mr-1" />
                              Programado
                            </Badge>
                          </div>
                          
                          {/* Test Schedule */}
                          <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 text-slate-500 mr-2" />
                              <p className="text-sm text-slate-700">Evaluación programada: 20 de mayo, 2023</p>
                            </div>
                            <div className="text-xs text-slate-500 mt-1 pl-6">Campo de tiro "El Guardián" - 9:00 AM</div>
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
            </TabsContent>
            
            <TabsContent value="vehicle" className="animate-fade-in">
              <div className="space-y-6">
                <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                  <h3 className="text-green-800 font-medium">Habilidades evaluadas</h3>
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex flex-col p-3 bg-white rounded-lg border border-slate-100">
                      <h4 className="font-medium text-slate-800">Conducción defensiva</h4>
                      <p className="text-xs text-slate-500 mt-1">Técnicas de manejo preventivo y evasivo</p>
                    </div>
                    <div className="flex flex-col p-3 bg-white rounded-lg border border-slate-100">
                      <h4 className="font-medium text-slate-800">Manejo en carretera</h4>
                      <p className="text-xs text-slate-500 mt-1">Evaluación de conducción en diferentes tipos de vías</p>
                    </div>
                    <div className="flex flex-col p-3 bg-white rounded-lg border border-slate-100">
                      <h4 className="font-medium text-slate-800">Respuesta a emergencias</h4>
                      <p className="text-xs text-slate-500 mt-1">Habilidad para manejar en situaciones de emergencia</p>
                    </div>
                    <div className="flex flex-col p-3 bg-white rounded-lg border border-slate-100">
                      <h4 className="font-medium text-slate-800">Conocimiento mecánico</h4>
                      <p className="text-xs text-slate-500 mt-1">Conocimiento básico sobre mecánica y mantenimiento</p>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-slate-50 p-3 border-b">
                    <h3 className="font-medium text-slate-700">Candidatos para evaluación</h3>
                  </div>
                  <div className="divide-y">
                    <div className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="w-full max-w-lg">
                          <h4 className="font-medium text-slate-800">Luis Hernández</h4>
                          <div className="text-sm text-slate-500 mt-1">Ex-taxista con 8 años de experiencia</div>
                          
                          <div className="mt-3 flex items-center gap-2">
                            <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200">
                              Custodio con Vehículo
                            </Badge>
                            <Badge variant="outline" className="bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200">
                              <Shield className="h-3 w-3 mr-1" />
                              En Evaluación
                            </Badge>
                          </div>
                          
                          {/* Test Results */}
                          <div className="mt-4 space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-slate-600">Conducción defensiva</span>
                              <Badge className="bg-green-500 text-white hover:bg-green-600">92%</Badge>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-slate-600">Manejo en carretera</span>
                              <Badge className="bg-green-500 text-white hover:bg-green-600">88%</Badge>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-slate-600">Respuesta a emergencias</span>
                              <Badge className="bg-amber-500 text-white hover:bg-amber-600">75%</Badge>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-slate-600">Conocimiento mecánico</span>
                              <Badge className="bg-slate-500 text-white hover:bg-slate-600">Pendiente</Badge>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                          <Button size="sm" variant="outline" className="h-8 gap-1 border-green-200 text-green-700 hover:bg-green-50">
                            <Check className="h-3.5 w-3.5" />
                            <span>Aprobar</span>
                          </Button>
                          <Button size="sm" variant="outline" className="h-8 gap-1 border-red-200 text-red-700 hover:bg-red-50">
                            <X className="h-3.5 w-3.5" />
                            <span>Reprobar</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
