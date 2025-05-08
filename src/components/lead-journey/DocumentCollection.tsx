
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileCheck, FilePlus, Search } from 'lucide-react';

export const DocumentCollection: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle>Entrega de Documentación</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-500 mb-6">
            Recopilación y verificación de documentos oficiales y personales requeridos en el proceso.
          </p>
          
          <div className="space-y-6">
            {/* Required Documents List */}
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
              <h3 className="text-purple-800 font-medium">Documentos requeridos</h3>
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center justify-between rounded p-2 bg-white border border-slate-100">
                  <span className="text-sm text-slate-700">Identificación oficial (INE/IFE)</span>
                  <Badge className="bg-green-500 text-white">Obligatorio</Badge>
                </div>
                <div className="flex items-center justify-between rounded p-2 bg-white border border-slate-100">
                  <span className="text-sm text-slate-700">CURP</span>
                  <Badge className="bg-green-500 text-white">Obligatorio</Badge>
                </div>
                <div className="flex items-center justify-between rounded p-2 bg-white border border-slate-100">
                  <span className="text-sm text-slate-700">Comprobante de domicilio</span>
                  <Badge className="bg-green-500 text-white">Obligatorio</Badge>
                </div>
                <div className="flex items-center justify-between rounded p-2 bg-white border border-slate-100">
                  <span className="text-sm text-slate-700">RFC</span>
                  <Badge className="bg-green-500 text-white">Obligatorio</Badge>
                </div>
                <div className="flex items-center justify-between rounded p-2 bg-white border border-slate-100">
                  <span className="text-sm text-slate-700">Credencial SEDENA (Custodios armados)</span>
                  <Badge className="bg-amber-500 text-white">Condicional</Badge>
                </div>
                <div className="flex items-center justify-between rounded p-2 bg-white border border-slate-100">
                  <span className="text-sm text-slate-700">Documentos del vehículo (Con vehículo)</span>
                  <Badge className="bg-amber-500 text-white">Condicional</Badge>
                </div>
                <div className="flex items-center justify-between rounded p-2 bg-white border border-slate-100">
                  <span className="text-sm text-slate-700">Cartas de recomendación</span>
                  <Badge className="bg-slate-500 text-white">Opcional</Badge>
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
                    <div>
                      <h4 className="font-medium text-slate-800">José Ramírez</h4>
                      <div className="text-sm text-slate-500 mt-1">Ex-policía estatal</div>
                      
                      <div className="mt-3 mb-3 flex items-center gap-2">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200">
                          Custodio Armado
                        </Badge>
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200">
                          Documentación en Proceso
                        </Badge>
                      </div>
                      
                      {/* Document Upload Progress */}
                      <div className="flex items-center gap-3 mt-4">
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div className="bg-purple-500 h-2 rounded-full" style={{ width: "65%" }}></div>
                        </div>
                        <span className="text-xs text-slate-600">4/7 documentos</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="h-8 gap-1">
                        <FilePlus className="h-3.5 w-3.5" />
                        <span>Subir Documentos</span>
                      </Button>
                      <Button size="sm" variant="outline" className="h-8 gap-1">
                        <Search className="h-3.5 w-3.5" />
                        <span>Ver Detalles</span>
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Candidate with complete documents */}
                <div className="p-4 bg-green-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-slate-800">Luis Hernández</h4>
                      <div className="text-sm text-slate-500 mt-1">Ex-taxista con 8 años de experiencia</div>
                      
                      <div className="mt-3 mb-3 flex items-center gap-2">
                        <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200">
                          Custodio con Vehículo
                        </Badge>
                        <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200">
                          Documentación Completa
                        </Badge>
                      </div>
                      
                      {/* Document Upload Progress */}
                      <div className="flex items-center gap-3 mt-4">
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: "100%" }}></div>
                        </div>
                        <span className="text-xs text-slate-600">7/7 documentos</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button size="sm" variant="default" className="h-8 gap-1 bg-green-600 hover:bg-green-700">
                        <FileCheck className="h-3.5 w-3.5" />
                        <span>Aprobar</span>
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
        </CardContent>
      </Card>
    </div>
  );
};
