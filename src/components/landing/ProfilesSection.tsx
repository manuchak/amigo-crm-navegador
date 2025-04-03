
import React from 'react';
import { Shield, Briefcase, BadgeCheck } from 'lucide-react';

const ProfilesSection: React.FC = () => {
  return (
    <div className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900">¿Quiénes pueden aplicar?</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Buscamos perfiles específicos para garantizar el éxito de nuestras operaciones de custodia
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gray-50 rounded-2xl p-8 shadow-sm hover:shadow-md transition-all-medium">
            <div className="bg-primary/10 p-3 rounded-full w-fit mb-6">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-900">Militares en retiro</h3>
            <p className="text-gray-600">
              Tu disciplina y entrenamiento son altamente valorados en nuestra red. 
              Aprovecha tus habilidades para generar ingresos atractivos y estables.
            </p>
          </div>
          
          <div className="bg-gray-50 rounded-2xl p-8 shadow-sm hover:shadow-md transition-all-medium">
            <div className="bg-primary/10 p-3 rounded-full w-fit mb-6">
              <Briefcase className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-900">Profesionales de seguridad</h3>
            <p className="text-gray-600">
              Si tienes experiencia en el sector de seguridad, tenemos 
              oportunidades perfectas para complementar tus ingresos actuales.
            </p>
          </div>
          
          <div className="bg-gray-50 rounded-2xl p-8 shadow-sm hover:shadow-md transition-all-medium">
            <div className="bg-primary/10 p-3 rounded-full w-fit mb-6">
              <BadgeCheck className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-900">Conductores con vehículo</h3>
            <p className="text-gray-600">
              Si cuentas con vehículo propio, puedes acceder a 
              mejores oportunidades y mayores ingresos en nuestro sistema.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilesSection;
