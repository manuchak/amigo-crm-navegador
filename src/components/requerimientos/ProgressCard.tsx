
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Edit, MapPin, Building, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
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

// Helper function to get status icon
const getStatusIcon = (estado?: string) => {
  switch (estado) {
    case 'aceptado':
      return <CheckCircle className="h-3 w-3 text-green-500" />;
    case 'recibido':
      return <Clock className="h-3 w-3 text-blue-500" />;
    case 'retrasado':
      return <AlertTriangle className="h-3 w-3 text-red-500" />;
    case 'solicitado':
    default:
      return <Clock className="h-3 w-3 text-amber-500" />;
  }
};

// Helper function to get status text
const getStatusText = (estado?: string) => {
  switch (estado) {
    case 'aceptado':
      return "Aceptado";
    case 'recibido':
      return "Recibido";
    case 'retrasado':
      return "Retrasado";
    case 'solicitado':
    default:
      return "Solicitado";
  }
};

const ProgressCard: React.FC<ProgressCardProps> = ({ req, index, onEdit }) => {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2 flex flex-row justify-between items-start">
        <div>
          <CardTitle>{req.categoria}</CardTitle>
          <CardDescription>
            {req.completados} custodios
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
                  <div className="col-span-5 flex items-center">
                    <MapPin className="h-3 w-3 mr-1 text-gray-400" />
                    <span className="truncate">{ciudad.ciudad}</span>
                  </div>
                  <div className="col-span-4 flex items-center justify-center">
                    {getStatusIcon(ciudad.estado)}
                    <span className="ml-1">{getStatusText(ciudad.estado)}</span>
                  </div>
                  <div className="col-span-3 text-right">
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
