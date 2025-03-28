
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface LeadsIntroProps {
  onGetStarted: () => void;
}

const LeadsIntro = ({ onGetStarted }: LeadsIntroProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 py-10 bg-gradient-to-br from-gray-50 to-gray-100">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-4xl mx-auto"
      >
        <Card className="overflow-hidden border-none shadow-xl bg-white rounded-2xl">
          <CardContent className="p-0">
            <div className="grid md:grid-cols-2 gap-0">
              {/* Left Side: Content */}
              <div className="p-10 flex flex-col justify-center">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <h2 className="text-3xl font-semibold tracking-tight text-gray-900 mb-2">
                    Gestión de Custodios
                  </h2>
                  
                  <p className="text-gray-600 mb-8 leading-relaxed">
                    Optimice el proceso de captación y seguimiento de custodios, 
                    desde la creación inicial hasta la aprobación final. Un flujo 
                    de trabajo simplificado para una gestión eficiente.
                  </p>
                </motion.div>
                
                <motion.div 
                  className="space-y-5 mb-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center">
                      <span className="font-semibold">1</span>
                    </div>
                    <div>
                      <h3 className="text-base font-medium text-gray-900">Creación</h3>
                      <p className="text-sm text-gray-500">Registre nuevos custodios y monitoree su progreso</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center">
                      <span className="font-semibold">2</span>
                    </div>
                    <div>
                      <h3 className="text-base font-medium text-gray-900">Seguimiento</h3>
                      <p className="text-sm text-gray-500">Call Center y gestión de comunicaciones</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center">
                      <span className="font-semibold">3</span>
                    </div>
                    <div>
                      <h3 className="text-base font-medium text-gray-900">Contacto</h3>
                      <p className="text-sm text-gray-500">Entrevistas y verificación de información</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-red-50 text-red-500 rounded-full flex items-center justify-center">
                      <span className="font-semibold">4</span>
                    </div>
                    <div>
                      <h3 className="text-base font-medium text-gray-900">Aprobación</h3>
                      <p className="text-sm text-gray-500">Apruebe custodios calificados y asigne equipamiento</p>
                    </div>
                  </div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                >
                  <Button 
                    onClick={onGetStarted} 
                    className="w-full py-6 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-base font-medium transition-all shadow-md hover:shadow-lg"
                  >
                    Comenzar
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </motion.div>
              </div>
              
              {/* Right Side: Image */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 flex items-center justify-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="w-full max-w-md"
                >
                  <img 
                    src="/leads-workflow.svg" 
                    alt="Workflow Process" 
                    className="w-full h-auto drop-shadow-lg"
                  />
                </motion.div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default LeadsIntro;
