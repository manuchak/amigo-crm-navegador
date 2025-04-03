
import React from 'react';
import { CheckCircle2 } from 'lucide-react';

const CompanySection: React.FC = () => {
  const companyFeatures = [
    'Más de 22 años de experiencia en el sector de seguridad',
    'Empresa 100% mexicana con presencia nacional',
    'Certificaciones y permisos federales vigentes',
    'Equipo profesional y altamente capacitado',
    'Infraestructura moderna para monitoreo y seguimiento',
    'Respuestas rápidas ante cualquier situación de emergencia'
  ];

  return (
    <div className="py-16 md:py-24 bg-gray-50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Respaldado por <span className="text-primary">Detecta Security</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl">
            Somos una empresa líder en el sector de seguridad con más de dos décadas 
            protegiendo a empresas y sus mercancías en todo el territorio nacional.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center mb-12">
          <div className="rounded-xl overflow-hidden shadow-xl">
            <img 
              src="/lovable-uploads/aab9f616-2ed4-4904-95b0-5ef02b4589a9.png"
              alt="Oficinas de Detecta Security" 
              className="w-full h-auto object-cover"
              width="800"
              height="500"
              loading="lazy"
            />
          </div>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">¿Por qué elegirnos?</h3>
              <p className="text-gray-600">
                Detecta Security ha construido una sólida reputación basada en la confianza 
                y el profesionalismo, ofreciendo soluciones de seguridad integral para empresas 
                de todos los tamaños.
              </p>
            </div>
            
            <ul className="space-y-3">
              {companyFeatures.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle2 className="text-primary mr-2 h-5 w-5 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanySection;
