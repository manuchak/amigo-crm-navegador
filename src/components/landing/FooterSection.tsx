
import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FooterSectionProps {
  scrollToRegistration: () => void;
}

const FooterSection: React.FC<FooterSectionProps> = ({ scrollToRegistration }) => {
  return (
    <>
      {/* CTA Section */}
      <div className="py-16 md:py-24 bg-gradient-to-r from-gray-900 to-black text-white">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">¿Listo para comenzar?</h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-8">
            Completa el formulario de registro en la parte superior de esta página
            y comienza a generar ingresos como custodio profesional.
          </p>
          <Button 
            size="lg" 
            onClick={scrollToRegistration}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            Registrarme ahora <ArrowRight className="ml-2" />
          </Button>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h2 className="text-xl font-bold">Detecta Security</h2>
              <p className="text-gray-400 mt-2">
                Tlalnepantla, Estado de México<br />
                Más de 22 años liderando la seguridad privada
              </p>
            </div>
            <div className="text-center md:text-right">
              <p className="text-gray-400 text-sm">
                © {new Date().getFullYear()} Detecta Security. Todos los derechos reservados.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default FooterSection;
