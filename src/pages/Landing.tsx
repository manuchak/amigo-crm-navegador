
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight, BadgeCheck, Briefcase, Clock, Shield } from 'lucide-react';

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

      // Insert into Supabase leads table
      const { error } = await supabase
        .from('leads')
        .insert({
          nombre: formData.nombre,
          email: formData.email,
          telefono: formData.telefono,
          empresa: categoria,
          estado: 'Nuevo',
          fuente: 'Landing',
          datos_adicionales: {
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
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-gray-800 to-gray-900 text-white">
        <div className="absolute inset-0 overflow-hidden">
          <img 
            src="/lovable-uploads/d2d23901-54f2-4c89-9239-1b78fba6cb63.png" 
            alt="Seguridad en transporte" 
            className="object-cover object-center w-full h-full opacity-20"
          />
        </div>
        
        <div className="relative container mx-auto px-6 py-20 md:py-24">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="flex-1 space-y-6">
              <div className="inline-block bg-primary px-4 py-1 rounded-full text-sm font-medium mb-2">
                Oportunidad Exclusiva
              </div>
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                Gana más de $30,000 mensuales <span className="text-primary">custodiando mercancía</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-300 max-w-2xl">
                Únete a nuestra red de custodios profesionales. Trabaja en tus tiempos, 
                cuando quieras y genera ingresos atractivos según tu disponibilidad.
              </p>
              <div className="pt-4">
                <Button 
                  size="lg" 
                  onClick={() => document.getElementById('registro')?.scrollIntoView({behavior: 'smooth'})}
                  className="bg-primary hover:bg-primary/90 text-white"
                >
                  Registrarme ahora <ArrowRight className="ml-2" />
                </Button>
              </div>
            </div>
            
            <div className="flex-1 w-full max-w-md">
              <div className="bg-white p-8 rounded-lg shadow-xl">
                <h2 className="text-gray-800 text-2xl font-bold mb-6">Beneficios destacados</h2>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <BadgeCheck className="h-6 w-6 text-primary flex-shrink-0 mr-3" />
                    <span className="text-gray-700">Ingresos superiores a $30,000 mensuales</span>
                  </li>
                  <li className="flex items-start">
                    <Clock className="h-6 w-6 text-primary flex-shrink-0 mr-3" />
                    <span className="text-gray-700">Flexibilidad total de horarios</span>
                  </li>
                  <li className="flex items-start">
                    <Briefcase className="h-6 w-6 text-primary flex-shrink-0 mr-3" />
                    <span className="text-gray-700">Oportunidades constantes de trabajo</span>
                  </li>
                  <li className="flex items-start">
                    <Shield className="h-6 w-6 text-primary flex-shrink-0 mr-3" />
                    <span className="text-gray-700">Valoramos tu experiencia militar o en seguridad</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Information Section */}
      <div className="container mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">¿Quiénes buscamos?</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Estamos reclutando perfiles específicos para nuestro modelo de crowdsourcing
            en custodia de mercancías
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3">Militares Retirados</h3>
            <p className="text-gray-600">
              Tu experiencia y formación son altamente valoradas. 
              Aprovecha tus habilidades para generar ingresos atractivos.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
              <Briefcase className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3">Personal de Seguridad</h3>
            <p className="text-gray-600">
              Si tienes experiencia en el sector de seguridad, tenemos 
              oportunidades perfectas para complementar tus ingresos.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
              <BadgeCheck className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3">Conductores con Vehículo</h3>
            <p className="text-gray-600">
              Si cuentas con vehículo propio, puedes acceder a 
              mejores oportunidades y mayores ingresos.
            </p>
          </div>
        </div>
      </div>
      
      {/* Registration Form */}
      <div id="registro" className="bg-gray-100 py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="md:flex">
              <div className="md:shrink-0 bg-primary p-6 md:p-8 text-white md:w-1/3">
                <h3 className="text-xl font-bold mb-4">¡Regístrate ahora!</h3>
                <p className="mb-6">
                  Completa este formulario y forma parte de nuestro equipo de custodios.
                </p>
                <div className="space-y-4 mt-8">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    <span>Flexibilidad horaria</span>
                  </div>
                  <div className="flex items-center">
                    <BadgeCheck className="h-5 w-5 mr-2" />
                    <span>Pagos competitivos</span>
                  </div>
                  <div className="flex items-center">
                    <Briefcase className="h-5 w-5 mr-2" />
                    <span>Posibilidad de ingresos extras</span>
                  </div>
                </div>
              </div>
              
              <div className="p-6 md:p-8 md:w-2/3">
                {isSuccess ? (
                  <div className="flex flex-col items-center justify-center py-6">
                    <BadgeCheck className="h-16 w-16 text-green-500 mb-4" />
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">¡Registro exitoso!</h3>
                    <p className="text-gray-600 text-center mb-6">
                      Hemos recibido tus datos. Un representante se pondrá en contacto contigo pronto.
                    </p>
                    <Button 
                      onClick={() => setIsSuccess(false)}
                      variant="outline"
                    >
                      Registrar otro candidato
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Información de contacto</h3>
                    
                    <div className="space-y-2">
                      <Label htmlFor="nombre">Nombre completo *</Label>
                      <Input
                        id="nombre"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        placeholder="Tu nombre completo"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Correo electrónico *</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="tu@correo.com"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="telefono">Teléfono *</Label>
                        <Input
                          id="telefono"
                          name="telefono"
                          value={formData.telefono}
                          onChange={handleChange}
                          placeholder="55 1234 5678"
                          required
                        />
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-800 mt-6 mb-4">Experiencia y recursos</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="tieneVehiculo">¿Tienes vehículo propio?</Label>
                        <Select 
                          value={formData.tieneVehiculo} 
                          onValueChange={(value) => handleSelectChange('tieneVehiculo', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="SI">Sí</SelectItem>
                            <SelectItem value="NO">No</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="experienciaSeguridad">¿Experiencia en seguridad?</Label>
                        <Select 
                          value={formData.experienciaSeguridad} 
                          onValueChange={(value) => handleSelectChange('experienciaSeguridad', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="SI">Sí</SelectItem>
                            <SelectItem value="NO">No</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="esMilitar">¿Eres militar o ex-militar?</Label>
                        <Select 
                          value={formData.esMilitar} 
                          onValueChange={(value) => handleSelectChange('esMilitar', value)}
                        >
                          <SelectTrigger>
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
                      />
                      <Label htmlFor="interesado" className="text-sm">
                        Estoy interesado en recibir información sobre oportunidades como custodio
                      </Label>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full mt-6"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Enviando...' : 'Enviar solicitud'}
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h2 className="text-xl font-bold">Custodios MX</h2>
              <p className="text-gray-400 mt-2">Oportunidades de seguridad bajo demanda</p>
            </div>
            <div className="text-center md:text-right">
              <p className="text-gray-400 text-sm">
                © {new Date().getFullYear()} Detecta Security. Todos los derechos reservados.
              </p>
            </div>
          </div>
        </div>
      </footer>
      
      <div className="fixed bottom-6 right-6">
        <Button 
          onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}
          size="icon"
          variant="secondary"
          className="rounded-full shadow-lg"
        >
          <ArrowRight className="rotate-270 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default Landing;
