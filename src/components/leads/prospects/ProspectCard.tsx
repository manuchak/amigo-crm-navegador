
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PhoneCall, Calendar, Car, Briefcase, Award, Clock } from 'lucide-react';
import { Prospect } from '@/services/prospectService';
import { formatPhoneNumber } from '@/lib/utils';

interface ProspectCardProps {
  prospect: Prospect;
  onViewDetails?: (prospect: Prospect) => void;
  onCall?: (prospect: Prospect) => void;
}

const ProspectCard: React.FC<ProspectCardProps> = ({ 
  prospect, 
  onViewDetails,
  onCall
}) => {
  // Format date helper
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-MX');
  };
  
  // Get status color
  const getStatusColor = (status: string | null) => {
    switch (status?.toLowerCase()) {
      case 'nuevo': return 'bg-blue-50 text-blue-600';
      case 'contactado': return 'bg-amber-50 text-amber-600';
      case 'calificado': return 'bg-green-50 text-green-600';
      case 'rechazado': return 'bg-red-50 text-red-600';
      default: return 'bg-slate-100 text-slate-600';
    }
  };
  
  return (
    <Card className="h-full shadow-sm hover:shadow transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-medium">
              {prospect.lead_name || prospect.custodio_name || "Prospecto Sin Nombre"}
            </CardTitle>
            <div className="text-sm text-slate-500 flex items-center mt-1">
              <PhoneCall className="h-3.5 w-3.5 mr-1 text-slate-400" />
              {formatPhoneNumber(prospect.lead_phone || prospect.phone_number_intl || "No disponible")}
            </div>
          </div>
          
          {prospect.lead_status && (
            <Badge className={`${getStatusColor(prospect.lead_status)}`}>
              {prospect.lead_status}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pb-3">
        <div className="grid grid-cols-2 gap-2">
          {prospect.car_brand && (
            <div className="flex items-center">
              <Car className="h-4 w-4 mr-1 text-slate-400" />
              <span className="text-sm">{prospect.car_brand} {prospect.car_model} {prospect.car_year}</span>
            </div>
          )}
          
          {prospect.security_exp && (
            <div className="flex items-center">
              <Briefcase className="h-4 w-4 mr-1 text-slate-400" />
              <span className="text-sm">Exp: {prospect.security_exp}</span>
            </div>
          )}
          
          {prospect.sedena_id && (
            <div className="flex items-center">
              <Award className="h-4 w-4 mr-1 text-slate-400" />
              <span className="text-sm">SEDENA: {prospect.sedena_id}</span>
            </div>
          )}
          
          {prospect.call_count !== null && prospect.call_count > 0 && (
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1 text-slate-400" />
              <span className="text-sm">{prospect.call_count} llamadas</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center mt-3 text-xs text-slate-400">
          <Calendar className="h-3.5 w-3.5 mr-1" />
          Creado: {formatDate(prospect.lead_created_at)}
        </div>
      </CardContent>
      
      <CardFooter className="pt-0 flex justify-between">
        {onViewDetails && (
          <Button variant="ghost" size="sm" onClick={() => onViewDetails(prospect)}>
            Ver detalles
          </Button>
        )}
        
        {onCall && (
          <Button variant="outline" size="sm" onClick={() => onCall(prospect)}>
            <PhoneCall className="h-4 w-4 mr-1" /> Llamar
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ProspectCard;
