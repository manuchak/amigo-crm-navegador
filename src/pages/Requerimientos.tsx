
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Edit, Save } from 'lucide-react';
import { useForm } from 'react-hook-form';

const Requerimientos = () => {
  // Datos desglosados por ciudad
  const [datosRequerimientos, setDatosRequerimientos] = useState([
    { 
      categoria: 'Adquisición Custodios', 
      completados: 38, 
      objetivo: 50, 
      porcentaje: 76,
      color: 'bg-blue-500',
      desglose: [
        { ciudad: 'CDMX', completados: 15, objetivo: 20 },
        { ciudad: 'Guadalajara', completados: 10, objetivo: 15 },
        { ciudad: 'Monterrey', completados: 8, objetivo: 10 },
        { ciudad: 'Veracruz', completados: 5, objetivo: 5 }
      ]
    },
    { 
      categoria: 'Custodios Nuevos', 
      completados: 12, 
      objetivo: 20, 
      porcentaje: 60,
      color: 'bg-purple-500' 
    },
    { 
      categoria: 'Contratos firmados', 
      completados: 5, 
      objetivo: 10, 
      porcentaje: 50,
      color: 'bg-emerald-500',
      desglose: [
        { ciudad: 'CDMX', completados: 2, objetivo: 4 },
        { ciudad: 'Guadalajara', completados: 1, objetivo: 3 },
        { ciudad: 'Monterrey', completados: 1, objetivo: 2 },
        { ciudad: 'Veracruz', completados: 1, objetivo: 1 }
      ]
    },
    { 
      categoria: 'Reuniones agendadas', 
      completados: 45, 
      objetivo: 40, 
      porcentaje: 112,
      color: 'bg-amber-500' 
    }
  ]);

  const mesesDelAnio = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const mesActual = new Date().getMonth();

  // Función para actualizar los datos
  const actualizarObjetivo = (categoriaIndex, datos) => {
    const nuevosDatos = [...datosRequerimientos];
    
    // Actualizar objetivo principal
    if (datos.objetivo) {
      nuevosDatos[categoriaIndex].objetivo = Number(datos.objetivo);
      nuevosDatos[categoriaIndex].porcentaje = Math.round((nuevosDatos[categoriaIndex].completados / Number(datos.objetivo)) * 100);
    }

    // Actualizar objetivos por ciudad si existen
    if (datos.desglose && nuevosDatos[categoriaIndex].desglose) {
      datos.desglose.forEach((ciudadDatos, idx) => {
        if (nuevosDatos[categoriaIndex].desglose[idx]) {
          nuevosDatos[categoriaIndex].desglose[idx].objetivo = Number(ciudadDatos.objetivo);
        }
      });
    }

    setDatosRequerimientos(nuevosDatos);
  };

  return (
    <div className="container mx-auto px-6 py-24">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Requerimientos</h1>
        <p className="text-muted-foreground mt-1">
          Seguimiento de objetivos completados vs. previstos para {mesesDelAnio[mesActual]}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {datosRequerimientos.map((req, index) => (
          <Card key={index} className="shadow-sm">
            <CardHeader className="pb-2 flex flex-row justify-between items-start">
              <div>
                <CardTitle>{req.categoria}</CardTitle>
                <CardDescription>
                  {req.completados} de {req.objetivo} ({req.porcentaje}% completado)
                </CardDescription>
              </div>
              <EditarObjetivo 
                categoria={req} 
                index={index} 
                onUpdate={actualizarObjetivo} 
              />
            </CardHeader>
            <CardContent>
              <Progress value={req.porcentaje > 100 ? 100 : req.porcentaje} className={`h-2 ${req.color}`} />
              
              <div className="mt-4 flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full ${req.color} mr-2`}></div>
                  <span>Completados: {req.completados}</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-gray-200 mr-2"></div>
                  <span>Objetivo: {req.objetivo}</span>
                </div>
              </div>

              {/* Desglose por ciudad si existe */}
              {req.desglose && (
                <div className="mt-4 pt-4 border-t">
                  <h4 className="text-sm font-medium mb-2">Desglose por ciudad</h4>
                  <div className="space-y-2">
                    {req.desglose.map((ciudad, idx) => (
                      <div key={idx} className="flex justify-between text-xs">
                        <span>{ciudad.ciudad}</span>
                        <span>{ciudad.completados} de {ciudad.objetivo} ({Math.round((ciudad.completados / ciudad.objetivo) * 100)}%)</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Forecast vs. Realidad (Anual)</CardTitle>
          <CardDescription>
            Comparativa entre los objetivos previstos y los resultados reales durante el año
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Forecast</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">240</div>
                <p className="text-muted-foreground">Requerimientos previstos</p>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Completados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">187</div>
                <p className="text-muted-foreground">Requerimientos realizados</p>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Efectividad</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">78%</div>
                <p className="text-muted-foreground">Porcentaje de cumplimiento</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Componente para editar objetivos
const EditarObjetivo = ({ categoria, index, onUpdate }) => {
  const [open, setOpen] = useState(false);
  
  const form = useForm({
    defaultValues: {
      objetivo: categoria.objetivo,
      desglose: categoria.desglose ? categoria.desglose.map(ciudad => ({
        ciudad: ciudad.ciudad,
        objetivo: ciudad.objetivo
      })) : undefined
    }
  });

  const handleSubmit = (data) => {
    onUpdate(index, data);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon">
          <Edit className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <h3 className="font-medium">Editar Forecast: {categoria.categoria}</h3>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="objetivo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Objetivo General</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} min="1" />
                    </FormControl>
                  </FormItem>
                )}
              />

              {categoria.desglose && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Objetivos por Ciudad</h4>
                  {categoria.desglose.map((ciudad, idx) => (
                    <FormField
                      key={idx}
                      control={form.control}
                      name={`desglose.${idx}.objetivo`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{ciudad.ciudad}</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} min="1" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              )}

              <div className="flex justify-end">
                <Button type="submit" size="sm">
                  <Save className="h-4 w-4 mr-2" />
                  Guardar
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default Requerimientos;
