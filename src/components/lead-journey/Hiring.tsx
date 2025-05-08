
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, FileCheck, Download, Search } from 'lucide-react';

export const Hiring: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle>Contratación</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-500 mb-6">
            Proceso de contratación y onboarding para los candidatos que aprobaron todas las etapas.
          </p>
          
          <div className="space-y-6">
            <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100">
              <h3 className="text-emerald-800 font-medium">Proceso de contratación</h3>
              <ol className="mt-3 space-y-3">
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mr-3 mt-0.5">
                    1
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-slate-800">Firma de contrato</h4>
                    <p className="text-xs text-slate-500 mt-1">Revisión y firma de contrato laboral y acuerdos de confidencialidad</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mr-3 mt-0.5">
                    2
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-slate-800">Alta en sistema</h4>
                    <p className="text-xs text-slate-500 mt-1">Registro en sistemas internos y de nómina</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mr-3 mt-0.5">
                    3
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-slate-800">Entrega de equipo</h4>
                    <p className="text-xs text-slate-500 mt-1">Entrega de equipo, uniforme y credenciales</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mr-3 mt-0.5">
                    4
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-slate-800">Instalación de Gadget</h4>
                    <p className="text-xs text-slate-500 mt-1">Instalación de dispositivos de seguridad y rastreo</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mr-3 mt-0.5">
                    5
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-slate-800">Capacitación inicial</h4>
                    <p className="text-xs text-slate-500 mt-1">Inducción y capacitación específica para el rol</p>
                  </div>
                </li>
              </ol>
            </div>
            
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-slate-50 p-3 border-b">
                <h3 className="font-medium text-slate-700">Candidatos en contratación</h3>
              </div>
              <div className="divide-y">
                {/* Candidate in hiring process */}
                <div className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="w-full max-w-lg">
                      <h4 className="font-medium text-slate-800">Luis Hernández</h4>
                      <div className="text-sm text-slate-500 mt-1">Ex-taxista con 8 años de experiencia</div>
                      
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200">
                          Custodio con Vehículo
                        </Badge>
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200">
                          En proceso de contratación
                        </Badge>
                      </div>
                      
                      {/* Hiring Progress */}
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">Firma de contrato</span>
                          <Badge className="bg-green-500 text-white hover:bg-green-600">
                            <Check className="h-3 w-3 mr-1" /> Completado
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">Alta en sistema</span>
                          <Badge className="bg-green-500 text-white hover:bg-green-600">
                            <Check className="h-3 w-3 mr-1" /> Completado
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">Entrega de equipo</span>
                          <Badge className="bg-amber-500 text-white hover:bg-amber-600">En proceso</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">Instalación de Gadget</span>
                          <Badge className="bg-slate-500 text-white hover:bg-slate-600">Programado</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">Capacitación inicial</span>
                          <Badge className="bg-slate-500 text-white hover:bg-slate-600">Pendiente</Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <Button size="sm" variant="outline" className="h-8 gap-1">
                        <Download className="h-3.5 w-3.5" />
                        <span>Contrato</span>
                      </Button>
                      <Button size="sm" variant="outline" className="h-8 gap-1">
                        <Search className="h-3.5 w-3.5" />
                        <span>Ver Detalles</span>
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Candidate with completed hiring process */}
                <div className="p-4 bg-green-50">
                  <div className="flex justify-between items-start">
                    <div className="w-full max-w-lg">
                      <h4 className="font-medium text-slate-800">Roberto Sánchez</h4>
                      <div className="text-sm text-slate-500 mt-1">Ex-militar con experiencia en seguridad privada</div>
                      
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200">
                          Custodio Armado
                        </Badge>
                        <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200">
                          Contratación Completada
                        </Badge>
                      </div>
                      
                      {/* Hiring Info */}
                      <div className="mt-4 p-3 bg-white rounded-lg border border-green-200">
                        <div className="flex items-center">
                          <FileCheck className="h-5 w-5 text-green-600 mr-2" />
                          <p className="text-sm font-medium text-green-800">Proceso completado el 5 de mayo, 2023</p>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 ml-7">
                          Custodio activo y asignado a servicios desde el 10 de mayo, 2023
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <Button size="sm" variant="outline" className="h-8 gap-1">
                        <Download className="h-3.5 w-3.5" />
                        <span>Expediente</span>
                      </Button>
                      <Button size="sm" variant="outline" className="h-8 gap-1">
                        <Search className="h-3.5 w-3.5" />
                        <span>Ver Perfil</span>
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
