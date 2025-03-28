
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

interface LeadsIntroProps {
  onGetStarted: () => void;
}

const LeadsIntro = ({ onGetStarted }: LeadsIntroProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 animate-fade-in">
      <Card className="max-w-3xl w-full bg-white/90 border-none shadow-lg overflow-hidden">
        <CardContent className="p-0">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Image Side */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 flex items-center justify-center">
              <div className="max-w-sm">
                <img 
                  src="/leads-workflow.svg" 
                  alt="Workflow Process" 
                  className="w-full h-auto"
                />
              </div>
            </div>
            
            {/* Content Side */}
            <div className="p-10 flex flex-col justify-center">
              <h2 className="text-3xl font-medium tracking-tight text-gray-900 mb-2">
                Gestión de Custodios
              </h2>
              
              <p className="text-gray-500 mb-8 leading-relaxed">
                Optimice el proceso de captación y seguimiento de custodios, desde la creación 
                inicial hasta la calificación final. Gestione llamadas, apruebe perfiles calificados 
                y asigne equipamiento con un flujo de trabajo integrado.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-50 text-blue-600 p-1 rounded-md">
                    <span className="text-xs font-medium">1</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Creación y Seguimiento</h3>
                    <p className="text-xs text-gray-500">Registre nuevos custodios y monitoree su progreso</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-blue-50 text-blue-600 p-1 rounded-md">
                    <span className="text-xs font-medium">2</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Call Center</h3>
                    <p className="text-xs text-gray-500">Contacte y gestione las comunicaciones con los custodios</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-blue-50 text-blue-600 p-1 rounded-md">
                    <span className="text-xs font-medium">3</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Aprobación y Suministros</h3>
                    <p className="text-xs text-gray-500">Apruebe custodios calificados y asigne equipamiento</p>
                  </div>
                </div>
              </div>
              
              <Button 
                onClick={onGetStarted} 
                className="mt-8 w-full transition-all"
              >
                Comenzar
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LeadsIntro;
