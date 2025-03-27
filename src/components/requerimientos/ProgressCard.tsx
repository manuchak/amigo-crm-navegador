
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Edit, MapPin, City } from 'lucide-react';
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
          <CardTitle>{req.categoria}</CardTitle>
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
            <h4 className="text-sm font-medium mb-2 flex items-center">
              <City className="h-4 w-4 mr-1 text-gray-500" />
              Desglose por ciudad
            </h4>
            <div className="space-y-2">
              {req.desglose.map((ciudad, idx) => (
                <div key={idx} className="grid grid-cols-8 gap-2 text-xs">
                  <div className="col-span-3 flex items-center">
                    <MapPin className="h-3 w-3 mr-1 text-gray-400" />
                    <span className="truncate">{ciudad.ciudad}</span>
                  </div>
                  <div className="col-span-2 text-right text-gray-500">
                    Completados: {ciudad.completados}
                  </div>
                  <div className="col-span-3 text-right">
                    <span className="font-medium">Objetivo: {ciudad.objetivo}</span>
                    <span className="ml-2 text-xs text-gray-500">
                      ({Math.round((ciudad.completados / ciudad.objetivo) * 100)}%)
                    </span>
                  </div>
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
