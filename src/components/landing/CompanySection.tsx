
import React from 'react';
import { BadgeCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CompanySection: React.FC = () => {
  return (
    <div className="py-16 md:py-24 bg-gray-100">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900">22 años de experiencia en seguridad</h2>
            <p className="text-lg text-gray-600">
              Detecta Security es una empresa líder en el sector de seguridad privada con más de dos décadas 
              en el mercado mexicano. Nuestras oficinas centrales están ubicadas en Tlalnepantla, Estado de México,
              desde donde coordinamos operaciones en todo el país.
            </p>
            <div className="space-y-4">
              <div className="flex items-start">
                <BadgeCheck className="h-5 w-5 text-primary flex-shrink-0 mr-3 mt-1" />
                <p className="text-gray-600">Empresa certificada con los más altos estándares de calidad</p>
              </div>
              <div className="flex items-start">
                <BadgeCheck className="h-5 w-5 text-primary flex-shrink-0 mr-3 mt-1" />
                <p className="text-gray-600">Más de 500 custodios activos en nuestra plataforma</p>
              </div>
              <div className="flex items-start">
                <BadgeCheck className="h-5 w-5 text-primary flex-shrink-0 mr-3 mt-1" />
                <p className="text-gray-600">Cobertura en toda la República Mexicana</p>
              </div>
            </div>
            <Button 
              className="bg-gray-900 hover:bg-gray-800 text-white"
            >
              Conoce más sobre Detecta
            </Button>
          </div>
          
          <div className="rounded-2xl overflow-hidden shadow-xl">
            <img 
              src="/lovable-uploads/7f0940ca-c426-4bd1-a60d-955b8a7c8967.png"
              alt="Oficinas de Detecta Security"
              className="w-full h-auto object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanySection;
