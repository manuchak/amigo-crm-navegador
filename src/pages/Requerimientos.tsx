
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const Requerimientos = () => {
  // Datos de ejemplo para mostrar métricas
  const datosRequerimientos = [
    { 
      categoria: 'Ventas mensuales', 
      completados: 38, 
      objetivo: 50, 
      porcentaje: 76,
      color: 'bg-blue-500' 
    },
    { 
      categoria: 'Clientes nuevos', 
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
      color: 'bg-emerald-500' 
    },
    { 
      categoria: 'Reuniones agendadas', 
      completados: 45, 
      objetivo: 40, 
      porcentaje: 112,
      color: 'bg-amber-500' 
    }
  ];

  const mesesDelAnio = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const mesActual = new Date().getMonth();

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
            <CardHeader className="pb-2">
              <CardTitle>{req.categoria}</CardTitle>
              <CardDescription>
                {req.completados} de {req.objetivo} ({req.porcentaje}% completado)
              </CardDescription>
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

export default Requerimientos;
