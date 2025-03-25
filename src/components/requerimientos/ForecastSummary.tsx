
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';

interface ForecastData {
  requerimientosPrevistos: number;
  requerimientosRealizados: number;
  efectividad: number;
}

interface ForecastSummaryProps {
  forecastData: ForecastData;
  onEdit: () => void;
}

const ForecastSummary: React.FC<ForecastSummaryProps> = ({ forecastData, onEdit }) => {
  return (
    <Card className="shadow-sm mb-10">
      <CardHeader className="flex flex-row justify-between items-start">
        <div>
          <CardTitle>Forecast vs. Realidad (Anual)</CardTitle>
          <CardDescription>
            Comparativa entre los objetivos previstos y los resultados reales durante el año
          </CardDescription>
        </div>
        <Button variant="ghost" size="icon" onClick={onEdit}>
          <Edit className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Forecast</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{forecastData.requerimientosPrevistos}</div>
              <p className="text-muted-foreground">Requerimientos previstos</p>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Completados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{forecastData.requerimientosRealizados}</div>
              <p className="text-muted-foreground">Requerimientos realizados</p>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Efectividad</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{forecastData.efectividad}%</div>
              <p className="text-muted-foreground">Porcentaje de cumplimiento</p>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};

export default ForecastSummary;
