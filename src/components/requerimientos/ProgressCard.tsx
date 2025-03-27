
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Edit, MapPin, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CiudadDesglose {
  ciudad: string;
  completados: number;
  estado?: 'solicitado' | 'recibido' | 'aceptado' | 'retrasado';
}

export interface RequerimientoData {
  categoria: string;
  completados: number;
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
            {req.completados} ({req.porcentaje}% completado)
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
        
        {/* Desglose por ciudad si existe */}
        {req.desglose && (
          <div className="mt-4 pt-4 border-t">
            <h4 className="text-sm font-medium mb-2 flex items-center">
              <Building className="h-4 w-4 mr-1 text-gray-500" />
              Desglose por ciudad
            </h4>
            <div className="space-y-2">
              {req.desglose.map((ciudad, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 text-xs">
                  <div className="col-span-6 flex items-center">
                    <MapPin className="h-3 w-3 mr-1 text-gray-400" />
                    <span className="truncate">{ciudad.ciudad}</span>
                  </div>
                  <div className="col-span-6 text-right">
                    <span className="font-medium">{ciudad.completados}</span>
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
