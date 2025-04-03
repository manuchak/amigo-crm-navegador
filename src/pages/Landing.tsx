
import React, { useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import HeroSection from '@/components/landing/HeroSection';
import BenefitsSection from '@/components/landing/BenefitsSection';
import CompanySection from '@/components/landing/CompanySection';
import ProfilesSection from '@/components/landing/ProfilesSection';
import FooterSection from '@/components/landing/FooterSection';
import { useIsMobile } from '@/hooks/use-mobile';

const Landing = () => {
  const registrationRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const scrollToRegistration = () => {
    registrationRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Form at the Top */}
      <div ref={registrationRef}>
        <HeroSection />
      </div>
      
      {/* Benefits Section */}
      <BenefitsSection />
      
      {/* Company Section with Office Image */}
      <CompanySection />
      
      {/* Target Profiles */}
      <ProfilesSection />
      
      {/* Footer and CTA */}
      <FooterSection scrollToRegistration={scrollToRegistration} />
      
      <div className="fixed bottom-6 right-6 z-50">
        <Button 
          onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}
          size="icon"
          className="rounded-full shadow-lg bg-primary hover:bg-primary/90 text-white"
        >
          <ArrowRight className="rotate-[-90deg] h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default Landing;
