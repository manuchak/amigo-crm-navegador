
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Phone, Check, X, Clock, Calendar, Filter, UserPlus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const LeadInitialInterview: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Entrevista Inicial</CardTitle>
              <CardDescription className="mt-1.5">
                Primera etapa del proceso de selección - Clasificación de candidatos
              </CardDescription>
            </div>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              <UserPlus className="h-4 w-4 mr-2" />
              Nuevo Candidato
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100 mb-6">
            <h3 className="text-blue-800 font-medium flex items-center">
              <Filter className="h-4 w-4 mr-2" />
              Proceso de Clasificación
            </h3>
            <p className="text-sm text-slate-600 mt-2">
              En la entrevista inicial, se evalúa brevemente a los candidatos para clasificarlos según su perfil y experiencia:
            </p>
            <ul className="mt-3 space-y-2">
              <li className="text-sm text-slate-700 flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                <span><span className="font-medium">Custodio Armado:</span> Candidatos con experiencia militar/policial y credencial SEDENA</span>
              </li>
              <li className="text-sm text-slate-700 flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                <span><span className="font-medium">Custodio con Vehículo:</span> Candidatos con vehículo propio y experiencia en conducción</span>
              </li>
            </ul>
          </div>
          
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">Todos los Candidatos</TabsTrigger>
              <TabsTrigger value="armed">Candidatos para Custodio Armado</TabsTrigger>
              <TabsTrigger value="vehicle">Candidatos para Custodio con Vehículo</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="animate-fade-in">
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-slate-50 p-3 border-b flex justify-between items-center">
                  <h3 className="font-medium text-slate-700">Candidatos a clasificar</h3>
                  <div className="flex items-center gap-2 text-xs">
                    <Badge variant="outline" className="bg-slate-50">15 Pendientes</Badge>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">8 Clasificados hoy</Badge>
                  </div>
                </div>
                <div className="divide-y">
                  {/* Candidate Row */}
                  <div className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-slate-800">Miguel Ángel González</h4>
                        <div className="text-sm text-slate-500 mt-1">Ex-militar con 5 años de experiencia</div>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <Badge variant="outline" className="bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200">
                            Nuevo
                          </Badge>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200">
                            Potencial Custodio Armado
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
                        <h4 className="font-medium text-slate-800">Carlos Vega</h4>
                        <div className="text-sm text-slate-500 mt-1">Conductor con experiencia en logística</div>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <Badge variant="outline" className="bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200">
                            Nuevo
                          </Badge>
                          <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200">
                            Potencial Custodio con Vehículo
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
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200">
                            <Clock className="h-3 w-3 mr-1" /> 
                            Entrevista: Hoy 15:00
                          </Badge>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200">
                            Potencial Custodio Armado
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="h-8 gap-1 border-slate-200">
                          <span>Pendiente</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="armed" className="animate-fade-in">
              <div className="space-y-4">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <h3 className="text-blue-800 font-medium">Criterios de Clasificación - Custodio Armado</h3>
                  <ul className="mt-2 space-y-1">
                    <li className="text-sm text-slate-700 flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      Experiencia con armas y portación de licencias
                    </li>
                    <li className="text-sm text-slate-700 flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      Antecedentes militares o policiales
                    </li>
                    <li className="text-sm text-slate-700 flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      Verificación de credencial SEDENA
                    </li>
                    <li className="text-sm text-slate-700 flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      Evaluación básica de temperamento
                    </li>
                  </ul>
                </div>
                
                {/* Candidates List */}
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-slate-50 p-3 border-b">
                    <h3 className="font-medium text-slate-700">Candidatos Clasificados como Custodio Armado</h3>
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
                          <Button size="sm" variant="outline" className="h-8 gap-1 border-green-200 text-green-700 hover:bg-green-50">
                            <Check className="h-3.5 w-3.5" />
                            <span>Aprobar</span>
                          </Button>
                          <Button size="sm" variant="outline" className="h-8 gap-1 border-red-200 text-red-700 hover:bg-red-50">
                            <X className="h-3.5 w-3.5" />
                            <span>Reclasificar</span>
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
                          <Button size="sm" variant="outline" className="h-8 gap-1 border-green-200 text-green-700 hover:bg-green-50">
                            <Check className="h-3.5 w-3.5" />
                            <span>Aprobar</span>
                          </Button>
                          <Button size="sm" variant="outline" className="h-8 gap-1 border-red-200 text-red-700 hover:bg-red-50">
                            <X className="h-3.5 w-3.5" />
                            <span>Reclasificar</span>
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
                  <h3 className="text-green-800 font-medium">Criterios de Clasificación - Custodio con Vehículo</h3>
                  <ul className="mt-2 space-y-1">
                    <li className="text-sm text-slate-700 flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      Verificación de propiedad del vehículo
                    </li>
                    <li className="text-sm text-slate-700 flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      Experiencia mínima de conducción
                    </li>
                    <li className="text-sm text-slate-700 flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      Conocimiento de rutas y zonas locales
                    </li>
                    <li className="text-sm text-slate-700 flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      Documentación del vehículo en regla
                    </li>
                  </ul>
                </div>
                
                {/* Candidates List */}
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-slate-50 p-3 border-b">
                    <h3 className="font-medium text-slate-700">Candidatos Clasificados como Custodio con Vehículo</h3>
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
                          <Button size="sm" variant="outline" className="h-8 gap-1 border-green-200 text-green-700 hover:bg-green-50">
                            <Check className="h-3.5 w-3.5" />
                            <span>Aprobar</span>
                          </Button>
                          <Button size="sm" variant="outline" className="h-8 gap-1 border-red-200 text-red-700 hover:bg-red-50">
                            <X className="h-3.5 w-3.5" />
                            <span>Reclasificar</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Candidate Row */}
                    <div className="p-4 hover:bg-slate-50 transition-colors">
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
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="h-8 gap-1 border-green-200 text-green-700 hover:bg-green-50">
                            <Check className="h-3.5 w-3.5" />
                            <span>Aprobar</span>
                          </Button>
                          <Button size="sm" variant="outline" className="h-8 gap-1 border-red-200 text-red-700 hover:bg-red-50">
                            <X className="h-3.5 w-3.5" />
                            <span>Reclasificar</span>
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
