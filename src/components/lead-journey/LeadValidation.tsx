
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, FileCheck, Search, X } from 'lucide-react';

export const LeadValidation: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle>Segunda Entrevista y Validación</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-500 mb-6">
            Segunda etapa del proceso donde se validan credenciales y se realiza una entrevista más exhaustiva.
          </p>
          
          <Tabs defaultValue="armed">
            <TabsList className="mb-4">
              <TabsTrigger value="armed">Custodio Armado</TabsTrigger>
              <TabsTrigger value="vehicle">Custodio con Vehículo</TabsTrigger>
            </TabsList>
            
            <TabsContent value="armed" className="animate-fade-in">
              <div className="space-y-4">
                <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
                  <h3 className="text-indigo-800 font-medium">Criterios de validación</h3>
                  <ul className="mt-2 space-y-1">
                    <li className="text-sm text-slate-700 flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      Validación de credencial SEDENA
                    </li>
                    <li className="text-sm text-slate-700 flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      Verificación de historial criminal
                    </li>
                    <li className="text-sm text-slate-700 flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      Revisión de referencias laborales
                    </li>
                    <li className="text-sm text-slate-700 flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      Evaluación técnica de manejo de armas
                    </li>
                  </ul>
                </div>
                
                {/* Validation List */}
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-slate-50 p-3 border-b">
                    <h3 className="font-medium text-slate-700">Candidatos en Validación</h3>
                  </div>
                  
                  <div className="divide-y">
                    {/* Candidate being validated */}
                    <div className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-slate-800">José Ramírez</h4>
                          <div className="text-sm text-slate-500 mt-1">Ex-policía estatal</div>
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200">
                              Custodio Armado
                            </Badge>
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200">
                              En Validación
                            </Badge>
                          </div>
                          
                          {/* Validation Progress */}
                          <div className="mt-4 space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-slate-600">Credencial SEDENA</span>
                              <Badge className="bg-green-500 text-white hover:bg-green-600">Verificado</Badge>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-slate-600">Historial Criminal</span>
                              <Badge className="bg-green-500 text-white hover:bg-green-600">Verificado</Badge>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-slate-600">Referencias Laborales</span>
                              <Badge className="bg-amber-500 text-white hover:bg-amber-600">En Proceso</Badge>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-slate-600">Evaluación Técnica</span>
                              <Badge className="bg-slate-500 text-white hover:bg-slate-600">Pendiente</Badge>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                          <Button size="sm" variant="default" className="h-8 gap-1">
                            <FileCheck className="h-3.5 w-3.5" />
                            <span>Completar Validación</span>
                          </Button>
                          <Button size="sm" variant="outline" className="h-8 gap-1">
                            <Search className="h-3.5 w-3.5" />
                            <span>Ver Detalles</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Candidate with validation issues */}
                    <div className="p-4 bg-red-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-slate-800">Pedro Jiménez</h4>
                          <div className="text-sm text-slate-500 mt-1">Guardia de seguridad</div>
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200">
                              Custodio Armado
                            </Badge>
                            <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-100 border-red-200">
                              Problemas de Validación
                            </Badge>
                          </div>
                          
                          {/* Validation Issues */}
                          <div className="mt-4 space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-slate-600">Credencial SEDENA</span>
                              <Badge className="bg-red-500 text-white hover:bg-red-600">No Verificada</Badge>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-slate-600">Historial Criminal</span>
                              <Badge className="bg-green-500 text-white hover:bg-green-600">Verificado</Badge>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-slate-600">Referencias Laborales</span>
                              <Badge className="bg-amber-500 text-white hover:bg-amber-600">Incompletas</Badge>
                            </div>
                          </div>
                          
                          <div className="mt-3 text-sm text-red-600 bg-red-50 p-2 rounded border border-red-100">
                            <strong>Nota:</strong> Credencial SEDENA no verificable en el sistema. Se requieren documentos adicionales.
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                          <Button size="sm" variant="destructive" className="h-8 gap-1">
                            <X className="h-3.5 w-3.5" />
                            <span>Rechazar</span>
                          </Button>
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
              <div className="space-y-4">
                <div className="bg-teal-50 rounded-lg p-4 border border-teal-100">
                  <h3 className="text-teal-800 font-medium">Criterios de validación</h3>
                  <ul className="mt-2 space-y-1">
                    <li className="text-sm text-slate-700 flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      Verificación de documentos del vehículo
                    </li>
                    <li className="text-sm text-slate-700 flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      Inspección física del vehículo
                    </li>
                    <li className="text-sm text-slate-700 flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      Validación de licencia de conducir
                    </li>
                    <li className="text-sm text-slate-700 flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      Historial de infracciones
                    </li>
                  </ul>
                </div>
                
                {/* Validation List */}
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-slate-50 p-3 border-b">
                    <h3 className="font-medium text-slate-700">Candidatos en Validación</h3>
                  </div>
                  
                  <div className="divide-y">
                    {/* Candidate being validated */}
                    <div className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-slate-800">Luis Hernández</h4>
                          <div className="text-sm text-slate-500 mt-1">Ex-taxista con 8 años de experiencia</div>
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200">
                              Custodio con Vehículo
                            </Badge>
                            <Badge variant="outline" className="text-slate-700">
                              Toyota Corolla 2020
                            </Badge>
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200">
                              En Validación
                            </Badge>
                          </div>
                          
                          {/* Validation Progress */}
                          <div className="mt-4 space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-slate-600">Documentos del Vehículo</span>
                              <Badge className="bg-green-500 text-white hover:bg-green-600">Verificados</Badge>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-slate-600">Inspección Física</span>
                              <Badge className="bg-amber-500 text-white hover:bg-amber-600">Programada</Badge>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-slate-600">Licencia de Conducir</span>
                              <Badge className="bg-green-500 text-white hover:bg-green-600">Verificada</Badge>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-slate-600">Historial de Infracciones</span>
                              <Badge className="bg-slate-500 text-white hover:bg-slate-600">Pendiente</Badge>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                          <Button size="sm" variant="default" className="h-8 gap-1">
                            <FileCheck className="h-3.5 w-3.5" />
                            <span>Completar Validación</span>
                          </Button>
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
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
