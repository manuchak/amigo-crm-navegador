
import React from 'react';
import { BadgeCheck, Clock, Briefcase, Shield } from 'lucide-react';

const BenefitsSection: React.FC = () => {
  return (
    <div className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900">Beneficios que te esperan</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Forma parte de nuestro modelo de crowdsourcing en custodia de mercancías y disfruta de estos beneficios
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-gray-50 p-8 rounded-2xl hover:shadow-lg transition-all-medium">
            <div className="bg-primary/10 p-3 rounded-full w-fit mb-6">
              <BadgeCheck className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-900">Ingresos superiores</h3>
            <p className="text-gray-600">
              Potencial de ganar más de $30,000 mensuales según tu disponibilidad y dedicación.
            </p>
          </div>
          
          <div className="bg-gray-50 p-8 rounded-2xl hover:shadow-lg transition-all-medium">
            <div className="bg-primary/10 p-3 rounded-full w-fit mb-6">
              <Clock className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-900">Flexibilidad total</h3>
            <p className="text-gray-600">
              Tú decides cuándo trabajar. Adapta las oportunidades a tu horario y necesidades personales.
            </p>
          </div>
          
          <div className="bg-gray-50 p-8 rounded-2xl hover:shadow-lg transition-all-medium">
            <div className="bg-primary/10 p-3 rounded-full w-fit mb-6">
              <Briefcase className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-900">Demanda constante</h3>
            <p className="text-gray-600">
              Oportunidades continuas de trabajo gracias a nuestra amplia cartera de clientes en todo México.
            </p>
          </div>
          
          <div className="bg-gray-50 p-8 rounded-2xl hover:shadow-lg transition-all-medium">
            <div className="bg-primary/10 p-3 rounded-full w-fit mb-6">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-900">Valoramos tu experiencia</h3>
            <p className="text-gray-600">
              Si tienes experiencia militar o en seguridad, tendrás mayores oportunidades y mejor compensación.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BenefitsSection;
