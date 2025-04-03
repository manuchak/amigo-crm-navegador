
import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import RegistrationForm from './RegistrationForm';

const HeroSection: React.FC = () => {
  return (
    <div className="relative bg-gradient-to-r from-gray-900 to-black text-white">
      <div className="absolute inset-0 overflow-hidden">
        <img 
          src="/lovable-uploads/3a29a8f2-6473-434e-8cb0-3b8a28c4697e.png" 
          alt="Vehículos de custodia" 
          className="object-cover object-center w-full h-full opacity-20"
        />
      </div>
      
      <div className="relative container mx-auto px-4 md:px-6 py-12 md:py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Hero Content */}
          <div className="space-y-6 order-1">
            <div className="inline-block bg-primary/90 px-4 py-1 rounded-full text-sm font-medium mb-2">
              Oportunidad Exclusiva
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
              Gana más de $30,000 mensuales <span className="text-primary">custodiando mercancía</span>
            </h1>
            <p className="text-base md:text-lg text-gray-300 max-w-2xl">
              Únete a nuestra red de custodios profesionales. Trabaja en tus tiempos, 
              cuando quieras y genera ingresos atractivos según tu disponibilidad.
            </p>
            <div className="pt-4 flex flex-wrap gap-4">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-white"
                onClick={() => document.getElementById('registro')?.scrollIntoView({behavior: 'smooth'})}
              >
                Conoce más <ArrowRight className="ml-2" />
              </Button>
            </div>
          </div>
          
          {/* Form Section */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 md:p-8 shadow-xl border border-white/20 order-2 animate-fade-in">
            <div id="registro">
              <RegistrationForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
