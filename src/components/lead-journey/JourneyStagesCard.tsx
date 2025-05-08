
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { JourneyWorkflow } from './JourneyWorkflow';

export const JourneyStagesCard: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="space-y-6">
      {/* Journey Visualization */}
      <Card className="overflow-hidden border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-medium text-slate-800">Proceso de Reclutamiento de Custodios</h2>
            <p className="text-slate-500 mt-1">Visualización del proceso completo de reclutamiento.</p>
          </div>
          
          <div className="flex justify-center mb-8">
            <img 
              src="/lovable-uploads/0ebda72f-8dd8-452d-b8c8-ead2d1363f28.png" 
              alt="Diagrama de flujo del proceso de reclutamiento" 
              className="max-w-full h-auto rounded-lg shadow-sm border border-slate-100"
            />
          </div>
          
          <div className="mt-8">
            <JourneyWorkflow />
          </div>
        </CardContent>
      </Card>

      {/* Journey Stages Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Initial Interviews */}
        <Card className="overflow-hidden border border-slate-100 transition-all hover:shadow-md">
          <CardContent className="p-0">
            <div className="bg-blue-50 p-4 border-b border-blue-100">
              <h3 className="text-lg font-medium text-blue-800">1. Entrevistas Iniciales</h3>
              <p className="text-blue-600 text-sm mt-1">Primera evaluación del candidato</p>
            </div>
            <div className="p-4 space-y-2">
              <p className="text-slate-600 text-sm">
                Entrevistas breves para evaluar la experiencia y perfil del candidato.
              </p>
              <div className="flex flex-col gap-2 mt-4">
                <div className="flex items-center text-sm text-slate-700">
                  <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                  <span>Custodio Armado</span>
                </div>
                <div className="flex items-center text-sm text-slate-700">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                  <span>Custodio con Vehículo</span>
                </div>
              </div>
              <Button 
                variant="ghost" 
                className="w-full justify-between mt-2 text-blue-600" 
                onClick={() => navigate('/lead-journey/interviews')}
              >
                Ver detalles <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Validation and Second Interview */}
        <Card className="overflow-hidden border border-slate-100 transition-all hover:shadow-md">
          <CardContent className="p-0">
            <div className="bg-indigo-50 p-4 border-b border-indigo-100">
              <h3 className="text-lg font-medium text-indigo-800">2. Validación</h3>
              <p className="text-indigo-600 text-sm mt-1">Verificación de credenciales y segunda entrevista</p>
            </div>
            <div className="p-4 space-y-2">
              <p className="text-slate-600 text-sm">
                Validación del perfil y segunda entrevista más exhaustiva.
              </p>
              <div className="flex items-center gap-2 mt-4">
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full w-3/4 bg-indigo-500 rounded-full"></div>
                </div>
                <span className="text-xs text-slate-500">75%</span>
              </div>
              <Button 
                variant="ghost" 
                className="w-full justify-between mt-2 text-indigo-600" 
                onClick={() => navigate('/lead-journey/validation')}
              >
                Ver detalles <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Documentation */}
        <Card className="overflow-hidden border border-slate-100 transition-all hover:shadow-md">
          <CardContent className="p-0">
            <div className="bg-purple-50 p-4 border-b border-purple-100">
              <h3 className="text-lg font-medium text-purple-800">3. Documentación</h3>
              <p className="text-purple-600 text-sm mt-1">Recolección de documentación requerida</p>
            </div>
            <div className="p-4 space-y-2">
              <p className="text-slate-600 text-sm">
                Entrega y verificación de documentación oficial y personal.
              </p>
              <div className="flex items-center gap-2 mt-4">
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full w-1/2 bg-purple-500 rounded-full"></div>
                </div>
                <span className="text-xs text-slate-500">50%</span>
              </div>
              <Button 
                variant="ghost" 
                className="w-full justify-between mt-2 text-purple-600" 
                onClick={() => navigate('/lead-journey/documents')}
              >
                Ver detalles <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Psychometric Tests */}
        <Card className="overflow-hidden border border-slate-100 transition-all hover:shadow-md">
          <CardContent className="p-0">
            <div className="bg-pink-50 p-4 border-b border-pink-100">
              <h3 className="text-lg font-medium text-pink-800">4. Exámenes Psicométricos</h3>
              <p className="text-pink-600 text-sm mt-1">Evaluación psicológica y aptitudinal</p>
            </div>
            <div className="p-4 space-y-2">
              <p className="text-slate-600 text-sm">
                Evaluación del perfil psicológico del candidato.
              </p>
              <div className="flex items-center gap-2 mt-4">
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full w-1/3 bg-pink-500 rounded-full"></div>
                </div>
                <span className="text-xs text-slate-500">33%</span>
              </div>
              <Button 
                variant="ghost" 
                className="w-full justify-between mt-2 text-pink-600" 
                onClick={() => navigate('/lead-journey/tests')}
              >
                Ver detalles <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Field Tests */}
        <Card className="overflow-hidden border border-slate-100 transition-all hover:shadow-md">
          <CardContent className="p-0">
            <div className="bg-amber-50 p-4 border-b border-amber-100">
              <h3 className="text-lg font-medium text-amber-800">5. Pruebas de Campo</h3>
              <p className="text-amber-600 text-sm mt-1">Evaluaciones prácticas especializadas</p>
            </div>
            <div className="p-4 space-y-2">
              <p className="text-slate-600 text-sm">
                Evaluaciones prácticas según el tipo de custodio.
              </p>
              <div className="flex flex-col gap-2 mt-4">
                <div className="flex items-center text-sm text-slate-700">
                  <div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
                  <span>Manejo de Armas</span>
                </div>
                <div className="flex items-center text-sm text-slate-700">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                  <span>Conducción y Manejo</span>
                </div>
              </div>
              <Button 
                variant="ghost" 
                className="w-full justify-between mt-2 text-amber-600" 
                onClick={() => navigate('/lead-journey/fieldtests')}
              >
                Ver detalles <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Hiring */}
        <Card className="overflow-hidden border border-slate-100 transition-all hover:shadow-md">
          <CardContent className="p-0">
            <div className="bg-emerald-50 p-4 border-b border-emerald-100">
              <h3 className="text-lg font-medium text-emerald-800">6. Contratación</h3>
              <p className="text-emerald-600 text-sm mt-1">Proceso de contratación y onboarding</p>
            </div>
            <div className="p-4 space-y-2">
              <p className="text-slate-600 text-sm">
                Finalización del proceso de reclutamiento e incorporación.
              </p>
              <div className="flex items-center gap-2 mt-4">
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full w-1/4 bg-emerald-500 rounded-full"></div>
                </div>
                <span className="text-xs text-slate-500">25%</span>
              </div>
              <Button 
                variant="ghost" 
                className="w-full justify-between mt-2 text-emerald-600" 
                onClick={() => navigate('/lead-journey/hiring')}
              >
                Ver detalles <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
