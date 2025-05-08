
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Phone, Check, X, Clock, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const LeadInitialInterview: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle>Entrevistas Iniciales</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-500 mb-6">
            Primera etapa del proceso de selección. Entrevistas breves para evaluar la experiencia y perfil del candidato.
          </p>
          
          <Tabs defaultValue="armed">
            <TabsList className="mb-4">
              <TabsTrigger value="armed">Custodio Armado</TabsTrigger>
              <TabsTrigger value="vehicle">Custodio con Vehículo</TabsTrigger>
            </TabsList>
            
            <TabsContent value="armed" className="animate-fade-in">
              <div className="space-y-4">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <h3 className="text-blue-800 font-medium">Enfoque de la entrevista</h3>
                  <ul className="mt-2 space-y-1">
                    <li className="text-sm text-slate-700 flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      Experiencia con armas y licencias
                    </li>
                    <li className="text-sm text-slate-700 flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      Habilidades de seguridad personal
                    </li>
                    <li className="text-sm text-slate-700 flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      Experiencia en situaciones de crisis
                    </li>
                    <li className="text-sm text-slate-700 flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      Verificación de credencial SEDENA
                    </li>
                  </ul>
                </div>
                
                {/* Candidates List */}
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-slate-50 p-3 border-b">
                    <h3 className="font-medium text-slate-700">Candidatos para Entrevista</h3>
                  </div>
                  <div className="divide-y">
                    {/* Candidate Row */}
                    <div className="p-4 hover:bg-slate-50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-slate-800">Miguel Ángel González</h4>
                          <div className="text-sm text-slate-500 mt-1">Ex-militar con 5 años de experiencia</div>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200">
                              Custodio Armado
                            </Badge>
                            <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200">
                              SEDENA
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="h-8 gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>Agendar</span>
                          </Button>
                          <Button size="sm" className="h-8 gap-1">
                            <Phone className="h-3.5 w-3.5" />
                            <span>Llamar</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Candidate Row */}
                    <div className="p-4 hover:bg-slate-50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-slate-800">Roberto Méndez</h4>
                          <div className="text-sm text-slate-500 mt-1">Experiencia en seguridad privada</div>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200">
                              Custodio Armado
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="h-8 gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>Agendar</span>
                          </Button>
                          <Button size="sm" className="h-8 gap-1">
                            <Phone className="h-3.5 w-3.5" />
                            <span>Llamar</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Candidate with scheduled interview */}
                    <div className="p-4 bg-slate-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-slate-800">José Ramírez</h4>
                          <div className="text-sm text-slate-500 mt-1">Ex-policía estatal</div>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200">
                              Custodio Armado
                            </Badge>
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200">
                              <Clock className="h-3 w-3 mr-1" /> 
                              Entrevista: Hoy 15:00
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="h-8 gap-1 border-green-200 text-green-700 hover:bg-green-50">
                            <Check className="h-3.5 w-3.5" />
                            <span>Aprobar</span>
                          </Button>
                          <Button size="sm" variant="outline" className="h-8 gap-1 border-red-200 text-red-700 hover:bg-red-50">
                            <X className="h-3.5 w-3.5" />
                            <span>Rechazar</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="vehicle" className="animate-fade-in">
              <div className="space-y-4">
                <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                  <h3 className="text-green-800 font-medium">Enfoque de la entrevista</h3>
                  <ul className="mt-2 space-y-1">
                    <li className="text-sm text-slate-700 flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      Verificación del vehículo y documentación
                    </li>
                    <li className="text-sm text-slate-700 flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      Experiencia de conducción en situaciones de riesgo
                    </li>
                    <li className="text-sm text-slate-700 flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      Conocimiento de rutas y mecánica básica
                    </li>
                    <li className="text-sm text-slate-700 flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      Habilidades de conducción defensiva
                    </li>
                  </ul>
                </div>
                
                {/* Candidates List */}
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-slate-50 p-3 border-b">
                    <h3 className="font-medium text-slate-700">Candidatos para Entrevista</h3>
                  </div>
                  <div className="divide-y">
                    {/* Candidate Row */}
                    <div className="p-4 hover:bg-slate-50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-slate-800">Carlos Vega</h4>
                          <div className="text-sm text-slate-500 mt-1">Experiencia como conductor particular</div>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200">
                              Custodio con Vehículo
                            </Badge>
                            <Badge variant="outline" className="text-slate-700">
                              Honda Civic 2019
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="h-8 gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>Agendar</span>
                          </Button>
                          <Button size="sm" className="h-8 gap-1">
                            <Phone className="h-3.5 w-3.5" />
                            <span>Llamar</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Candidate with scheduled interview */}
                    <div className="p-4 bg-slate-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-slate-800">Luis Hernández</h4>
                          <div className="text-sm text-slate-500 mt-1">Ex-taxista con 8 años de experiencia</div>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200">
                              Custodio con Vehículo
                            </Badge>
                            <Badge variant="outline" className="text-slate-700">
                              Toyota Corolla 2020
                            </Badge>
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200">
                              <Clock className="h-3 w-3 mr-1" /> 
                              Entrevista: Mañana 10:30
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="secondary" className="h-8 gap-1" disabled>
                            <span>Pendiente</span>
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
