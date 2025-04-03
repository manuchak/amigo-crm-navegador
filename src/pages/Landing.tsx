
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight, BadgeCheck, Briefcase, Clock, Shield } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const Landing = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    tieneVehiculo: 'NO',
    experienciaSeguridad: 'NO',
    esMilitar: 'NO',
    interesado: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const isMobile = useIsMobile();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, interesado: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Determine the category based on responses
      let categoria = 'Custodio';
      const atributos = [];
      
      if (formData.tieneVehiculo === 'SI') {
        atributos.push('con vehículo');
      }
      
      if (formData.experienciaSeguridad === 'SI') {
        atributos.push('con experiencia');
      }
      
      if (formData.esMilitar === 'SI') {
        atributos.push('militar');
      }
      
      if (atributos.length > 0) {
        categoria += ` (${atributos.join(', ')})`;
      }

      // Insert into Supabase leads table with the correct structure
      const { error } = await supabase
        .from('leads')
        .insert({
          datos_adicionales: {
            nombre: formData.nombre,
            email: formData.email,
            telefono: formData.telefono,
            empresa: categoria,
            estado: 'Nuevo',
            fuente: 'Landing',
            tieneVehiculo: formData.tieneVehiculo,
            experienciaSeguridad: formData.experienciaSeguridad,
            esMilitar: formData.esMilitar,
            fecha_creacion: new Date().toISOString()
          }
        });
      
      if (error) throw error;
      
      setIsSuccess(true);
      toast.success("¡Registro exitoso! Nos pondremos en contacto contigo pronto.", {
        duration: 5000
      });
      
      // Reset form
      setFormData({
        nombre: '',
        email: '',
        telefono: '',
        tieneVehiculo: 'NO',
        experienciaSeguridad: 'NO',
        esMilitar: 'NO',
        interesado: true
      });
      
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error("Hubo un problema al enviar tus datos. Inténtalo de nuevo.", {
        duration: 5000
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Form at the Top */}
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
            {/* Form Section - Positioned at the top */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 md:p-8 shadow-xl border border-white/20 order-2 lg:order-1 animate-fade-in">
              <div id="registro">
                {isSuccess ? (
                  <div className="flex flex-col items-center justify-center py-6">
                    <BadgeCheck className="h-16 w-16 text-green-500 mb-4" />
                    <h3 className="text-2xl font-bold text-white mb-2">¡Registro exitoso!</h3>
                    <p className="text-gray-200 text-center mb-6">
                      Hemos recibido tus datos. Un representante se pondrá en contacto contigo pronto.
                    </p>
                    <Button 
                      onClick={() => setIsSuccess(false)}
                      className="bg-white/20 hover:bg-white/30 text-white"
                    >
                      Registrar otro candidato
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <h3 className="text-xl font-bold text-white mb-4">Regístrate ahora</h3>
                    
                    <div className="space-y-2">
                      <Label htmlFor="nombre" className="text-gray-200">Nombre completo *</Label>
                      <Input
                        id="nombre"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        placeholder="Tu nombre completo"
                        required
                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-gray-200">Correo electrónico *</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="tu@correo.com"
                          required
                          className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="telefono" className="text-gray-200">Teléfono *</Label>
                        <Input
                          id="telefono"
                          name="telefono"
                          value={formData.telefono}
                          onChange={handleChange}
                          placeholder="55 1234 5678"
                          required
                          className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                        />
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-medium text-white mt-4 mb-2">Experiencia y recursos</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="tieneVehiculo" className="text-gray-200">¿Tienes vehículo propio?</Label>
                        <Select 
                          value={formData.tieneVehiculo} 
                          onValueChange={(value) => handleSelectChange('tieneVehiculo', value)}
                        >
                          <SelectTrigger className="bg-white/10 border-white/20 text-white">
                            <SelectValue placeholder="Seleccionar" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="SI">Sí</SelectItem>
                            <SelectItem value="NO">No</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="experienciaSeguridad" className="text-gray-200">¿Experiencia en seguridad?</Label>
                        <Select 
                          value={formData.experienciaSeguridad} 
                          onValueChange={(value) => handleSelectChange('experienciaSeguridad', value)}
                        >
                          <SelectTrigger className="bg-white/10 border-white/20 text-white">
                            <SelectValue placeholder="Seleccionar" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="SI">Sí</SelectItem>
                            <SelectItem value="NO">No</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="esMilitar" className="text-gray-200">¿Eres militar o ex-militar?</Label>
                        <Select 
                          value={formData.esMilitar} 
                          onValueChange={(value) => handleSelectChange('esMilitar', value)}
                        >
                          <SelectTrigger className="bg-white/10 border-white/20 text-white">
                            <SelectValue placeholder="Seleccionar" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="SI">Sí</SelectItem>
                            <SelectItem value="NO">No</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 mt-4">
                      <Checkbox 
                        id="interesado" 
                        checked={formData.interesado}
                        onCheckedChange={handleCheckboxChange}
                        className="border-white/30 data-[state=checked]:bg-primary"
                      />
                      <Label htmlFor="interesado" className="text-sm text-gray-200">
                        Estoy interesado en recibir información sobre oportunidades como custodio
                      </Label>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-primary hover:bg-primary/90 text-white"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Enviando...' : 'Enviar solicitud'}
                    </Button>
                  </form>
                )}
              </div>
            </div>
            
            {/* Hero Content */}
            <div className="space-y-6 order-1 lg:order-2">
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
                >
                  Conoce más <ArrowRight className="ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Benefits Section - Apple-like clean design */}
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
      
      {/* Company Section with Office Image */}
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
      
      {/* Target Profiles */}
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
            onClick={() => document.getElementById('registro')?.scrollIntoView({behavior: 'smooth'})}
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
