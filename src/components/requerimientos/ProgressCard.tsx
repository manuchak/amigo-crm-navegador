
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CiudadDesglose {
  ciudad: string;
  completados: number;
  objetivo: number;
}

export interface RequerimientoData {
  categoria: string;
  completados: number;
  objetivo: number;
  porcentaje: number;
  color: string;
  desglose?: CiudadDesglose[];
}

interface ProgressCardProps {
  req: RequerimientoData;
  index: number;
  onEdit: (index: number) => void;
}

const ProgressCard: React.FC<ProgressCardProps> = ({ req, index, onEdit }) => {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2 flex flex-row justify-between items-start">
        <div>
          <CardTitle>Custodios con Vehiculo</CardTitle>
          <CardDescription>
            {req.completados} de {req.objetivo} ({req.porcentaje}% completado)
          </CardDescription>
        </div>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => onEdit(index)}
        >
          <Edit className="h-4 w-4" />
        </Button>
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
                  <span>
                    {ciudad.completados} de {ciudad.objetivo} ({Math.round((ciudad.completados / ciudad.objetivo) * 100)}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProgressCard;
