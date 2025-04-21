
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Prospect } from '@/services/prospectService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatPhoneNumber } from '@/lib/utils';
import { PhoneCall, FileText, Clock, CheckSquare, Info, Check, X } from 'lucide-react';

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
  const getStatusColor = (status: string | null) => {
    switch (status?.toLowerCase()) {
      case 'nuevo': return 'bg-blue-50 text-blue-600';
      case 'contactado': return 'bg-amber-50 text-amber-600';
      case 'contacto llamado': return 'bg-amber-50 text-amber-600';
      case 'calificado': return 'bg-green-50 text-green-600';
      case 'rechazado': return 'bg-red-50 text-red-600';
      default: return 'bg-slate-100 text-slate-600';
    }
  };
  
  const formatDate = (date: string | null) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('es-MX', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format boolean values to "Sí" or "No" with appropriate icons
  const formatBoolean = (value: boolean | null | undefined) => {
    if (value === true) return (
      <span className="flex items-center text-green-600">
        <Check className="h-3.5 w-3.5 mr-1" /> Sí
      </span>
    );
    if (value === false) return (
      <span className="flex items-center text-red-600">
        <X className="h-3.5 w-3.5 mr-1" /> No
      </span>
    );
    return "No especificado";
  };
  
  const hasCallHistory = prospect.call_count !== null && prospect.call_count > 0;
  const hasInterviewData = prospect.transcript !== null;
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base">
            {prospect.lead_name || prospect.custodio_name || "Sin nombre"}
          </CardTitle>
          {prospect.lead_status && (
            <Badge className={getStatusColor(prospect.lead_status)}>
              {prospect.lead_status}
            </Badge>
          )}
        </div>
        <div className="text-sm text-slate-500 flex flex-col">
          <span>{formatPhoneNumber(prospect.lead_phone || prospect.phone_number_intl || "")}</span>
          {prospect.lead_email && <span className="text-xs">{prospect.lead_email}</span>}
        </div>
        {hasInterviewData && (
          <Badge variant="outline" className="mt-2 bg-green-50 text-green-600 border-green-200">
            <FileText className="h-3 w-3 mr-1" /> Con entrevista
          </Badge>
        )}
      </CardHeader>
      
      <CardContent className="py-2 flex-grow">
        <div className="space-y-2 text-sm">
          {prospect.car_brand && (
            <div className="flex justify-between">
              <span className="text-slate-500">Vehículo:</span>
              <span>{prospect.car_brand} {prospect.car_model} {prospect.car_year}</span>
            </div>
          )}
          
          {prospect.security_exp && (
            <div className="flex justify-between">
              <span className="text-slate-500">Experiencia:</span>
              <span>{prospect.security_exp}</span>
            </div>
          )}

          {prospect.sedena_id && (
            <div className="flex justify-between">
              <span className="text-slate-500">ID SEDENA:</span>
              <span>{prospect.sedena_id}</span>
            </div>
          )}
          
          {/* SEDENA Info with Yes/No formatting */}
          {typeof prospect.has_security_experience !== 'undefined' && (
            <div className="flex justify-between">
              <span className="text-slate-500">Exp. Seguridad:</span>
              {formatBoolean(prospect.has_security_experience)}
            </div>
          )}

          {typeof prospect.has_firearm_license !== 'undefined' && (
            <div className="flex justify-between">
              <span className="text-slate-500">Licencia armas:</span>
              {formatBoolean(prospect.has_firearm_license)}
            </div>
          )}

          {typeof prospect.has_military_background !== 'undefined' && (
            <div className="flex justify-between">
              <span className="text-slate-500">Militar:</span>
              {formatBoolean(prospect.has_military_background)}
            </div>
          )}
          
          {hasCallHistory && (
            <div className="flex justify-between">
              <span className="text-slate-500">Llamadas:</span>
              <span>
                {prospect.call_count} {prospect.call_count === 1 ? 'llamada' : 'llamadas'}
                {prospect.last_call_date && (
                  <span className="text-xs block text-slate-400">
                    Última: {formatDate(prospect.last_call_date)}
                  </span>
                )}
              </span>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="pt-2 flex flex-wrap gap-2">
        {onCall && (
          <Button variant="outline" size="sm" className="flex-1" onClick={() => onCall(prospect)}>
            <PhoneCall className="h-3.5 w-3.5 mr-1" /> Llamar
          </Button>
        )}
        
        {onViewDetails && (
          <Button variant="ghost" size="sm" className="flex-1" onClick={() => onViewDetails(prospect)}>
            <Info className="h-3.5 w-3.5 mr-1" /> Detalle
          </Button>
        )}
        
        {onViewCalls && hasCallHistory && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onViewCalls(prospect)}
            className="flex-1 bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200"
          >
            <Clock className="h-3.5 w-3.5 mr-1" /> Historial
          </Button>
        )}
        
        {onValidate && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onValidate(prospect)}
            className="flex-1 bg-green-50 text-green-600 hover:bg-green-100 border-green-200"
          >
            <CheckSquare className="h-3.5 w-3.5 mr-1" /> Validar
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ProspectCard;
