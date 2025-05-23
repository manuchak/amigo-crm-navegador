
import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import RegistrationForm from './RegistrationForm';

const HeroSection: React.FC = () => {
  return (
    <div className="relative bg-gradient-to-r from-[rgb(25,25,25)] to-[rgb(40,40,40)] text-white">
      <div className="absolute inset-0 overflow-hidden">
        <img 
          src="/lovable-uploads/53b1a2a4-0108-47f7-b657-a87fe91d23ca.png" 
          alt="Vehículos de custodia" 
          className="object-cover object-center w-full h-full opacity-15"
          width="1200"
          height="675"
          loading="eager"
        />
      </div>
      
      <div className="relative container mx-auto px-4 md:px-6 py-12 md:py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="bg-black/30 backdrop-blur-lg rounded-2xl p-6 md:p-8 shadow-xl border border-white/10 order-1 lg:order-1 animate-fade-in">
            <div id="registro">
              <RegistrationForm />
            </div>
          </div>
          
          <div className="space-y-6 order-2 lg:order-2">
            <div className="inline-block bg-accent px-4 py-1 rounded-full text-sm font-medium mb-2">
              Oportunidad Exclusiva
            </div>
            <h1 className="font-bold leading-tight text-white">
              Gana más de $30,000 mensuales <span className="text-accent">custodiando mercancía</span>
            </h1>
            <p className="text-base md:text-lg text-gray-300 max-w-2xl">
              Únete a nuestra red de custodios profesionales. Trabaja en tus tiempos, 
              cuando quieras y genera ingresos atractivos según tu disponibilidad.
            </p>
            <div className="pt-4 flex flex-wrap gap-4">
              <Button 
                size="lg" 
                className="bg-accent hover:bg-accent/90 text-white"
                onClick={() => window.open('https://www.detectasecurity.io', '_blank', 'noopener,noreferrer')}
              >
                Conoce más <ArrowRight className="ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
