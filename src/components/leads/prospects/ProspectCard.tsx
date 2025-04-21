
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PhoneCall, Calendar, Car, Briefcase, Award, Clock, FileText, CheckSquare } from 'lucide-react';
import { Prospect } from '@/services/prospectService';
import { formatPhoneNumber } from '@/lib/utils';

interface ProspectCardProps {
  prospect: Prospect;
  onViewDetails?: (prospect: Prospect) => void;
  onCall?: (prospect: Prospect) => void;
  onViewCalls?: (prospect: Prospect) => void;
  onValidate?: (prospect: Prospect) => void;
}

const ProspectCard: React.FC<ProspectCardProps> = ({ 
  prospect, 
  onViewDetails,
  onCall,
  onViewCalls,
  onValidate
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
  
  // Check if prospect has call history
  const hasCallHistory = prospect.call_count !== null && prospect.call_count > 0;
  
  // Check if prospect has interview data
  const hasInterviewData = prospect.transcript !== null;
  
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
      
      <CardContent className="pb-2">
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
              {prospect.last_call_date && (
                <span className="text-xs text-slate-400 ml-1">
                  (Última: {formatDate(prospect.last_call_date)})
                </span>
              )}
            </div>
          )}
        </div>
        
        <div className="flex items-center mt-3 text-xs text-slate-400">
          <Calendar className="h-3.5 w-3.5 mr-1" />
          Creado: {formatDate(prospect.lead_created_at)}
        </div>

        {hasInterviewData && (
          <div className="mt-2">
            <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
              <FileText className="h-3 w-3 mr-1" /> Entrevista disponible
            </Badge>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-2 flex flex-wrap gap-2">
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

        {onViewCalls && hasCallHistory && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onViewCalls(prospect)}
            className="bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200"
          >
            <Clock className="h-4 w-4 mr-1" /> Historial
          </Button>
        )}
        
        {onValidate && hasInterviewData && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onValidate(prospect)}
            className="bg-green-50 text-green-600 hover:bg-green-100 border-green-200"
          >
            <CheckSquare className="h-4 w-4 mr-1" /> Validar
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ProspectCard;
