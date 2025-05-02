
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Prospect } from '@/services/prospectService';
import { formatPhoneNumber } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Phone, Car, Shield, ClipboardCheck, Eye, PhoneCall, History, Mail, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

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
  const hasCallHistory = prospect.call_count !== null && prospect.call_count > 0;
  const hasInterviewData = prospect.transcript !== null;

  // Generate status color based on ended_reason
  const getEndedReasonColor = (reason: string | null | undefined): string => {
    if (!reason) return "bg-gray-200 text-gray-700";
    
    const reasonLower = reason.toLowerCase();
    
    if (reasonLower.includes('completed') || reasonLower.includes('completado')) {
      return "bg-green-100 text-green-800 border-green-200";
    } 
    else if (reasonLower.includes('answered') || reasonLower.includes('contestado')) {
      return "bg-blue-100 text-blue-800 border-blue-200";
    }
    else if (reasonLower.includes('busy') || reasonLower.includes('ocupado')) {
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    } 
    else if (reasonLower.includes('no-answer') || reasonLower.includes('no contestado') || reasonLower.includes('missing')) {
      return "bg-orange-100 text-orange-800 border-orange-200";
    }
    else if (reasonLower.includes('failed') || reasonLower.includes('fallido') || reasonLower.includes('error')) {
      return "bg-red-100 text-red-800 border-red-200";
    }
    
    return "bg-gray-200 text-gray-700";
  };

  return (
    <Card 
      className="h-full border shadow-sm hover:shadow-md transition-all" 
      style={{
        borderLeft: prospect.ended_reason?.toLowerCase().includes('completed') ? '4px solid #10b981' : 
                  prospect.ended_reason?.toLowerCase().includes('no-answer') ? '4px solid #f97316' :
                  prospect.ended_reason?.toLowerCase().includes('busy') ? '4px solid #eab308' :
                  prospect.ended_reason?.toLowerCase().includes('failed') ? '4px solid #ef4444' :
                  prospect.lead_status === "Calificado" ? '4px solid #9b87f5' : '4px solid #e5e7eb'
      }}
    >
      <CardContent className="p-4">
        <div className="flex flex-col space-y-2">
          {/* Header section with name and status */}
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium text-base truncate" title={prospect.lead_name || prospect.custodio_name || "Sin nombre"}>
                {prospect.lead_name || prospect.custodio_name || "Sin nombre"}
              </h3>
              <p className="text-xs text-slate-500">
                ID: {prospect.lead_id}
              </p>
            </div>
            <Badge 
              variant={
                prospect.lead_status === "Calificado" ? "default" : 
                prospect.lead_status === "Contactado" ? "secondary" : 
                prospect.lead_status === "Rechazado" ? "destructive" : 
                "outline"
              }
            >
              {prospect.lead_status || "Nuevo"}
            </Badge>
          </div>
          
          {/* Contact information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="space-y-1">
              <div className="flex items-center text-sm">
                <Phone className="h-3.5 w-3.5 mr-2 text-slate-400" />
                <span className="font-mono truncate" title={prospect.lead_phone || prospect.phone_number_intl || "No disponible"}>
                  {formatPhoneNumber(prospect.lead_phone || prospect.phone_number_intl || "No disponible")}
                </span>
              </div>
              
              {prospect.lead_email && (
                <div className="flex items-center text-xs text-slate-600">
                  <Mail className="h-3.5 w-3.5 mr-2 text-slate-400" />
                  <span className="truncate" title={prospect.lead_email}>{prospect.lead_email}</span>
                </div>
              )}
            </div>
            
            <div className="text-right">
              <div className="flex items-center justify-end text-xs text-slate-600">
                <Calendar className="h-3.5 w-3.5 mr-1 text-slate-400" />
                <span>
                  {new Date(prospect.lead_created_at || '').toLocaleDateString('es-MX', { 
                    year: 'numeric', 
                    month: '2-digit', 
                    day: '2-digit',
                  })}
                </span>
              </div>
              
              {hasCallHistory && (
                <div className="flex justify-end mt-1">
                  <div className="flex items-center text-xs bg-slate-100 px-2 py-0.5 rounded">
                    <Phone className="h-3 w-3 mr-1 text-slate-600" />
                    <span>{prospect.call_count || 0} llamadas</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Additional information */}
          <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2 rounded-md">
            <div className="flex flex-col">
              <div className="flex items-center text-xs text-slate-600">
                <Car className="h-3.5 w-3.5 mr-1 text-slate-400" />
                <span>Vehículo</span>
              </div>
              <p className="text-xs truncate">
                {prospect.car_brand ? (
                  <span title={`${prospect.car_brand} ${prospect.car_model} ${prospect.car_year}`}>
                    {prospect.car_brand} {prospect.car_model} {prospect.car_year}
                  </span>
                ) : (
                  <span className="text-slate-400">No registrado</span>
                )}
              </p>
            </div>
            
            <div className="flex flex-col">
              <div className="flex items-center text-xs text-slate-600">
                <Shield className="h-3.5 w-3.5 mr-1 text-slate-400" />
                <span>SEDENA</span>
              </div>
              <p className="text-xs truncate" title={prospect.sedena_id || "Sin ID"}>
                {prospect.sedena_id || <span className="text-slate-400">Sin ID</span>}
              </p>
            </div>
          </div>
          
          {/* Call status section - prominently displayed */}
          {prospect.ended_reason && (
            <div className="mt-1">
              <Badge 
                variant="outline" 
                className={`w-full flex justify-center py-1 text-xs font-medium ${getEndedReasonColor(prospect.ended_reason)}`}
              >
                {prospect.ended_reason}
              </Badge>
            </div>
          )}
          
          {/* Display interview completion indicator */}
          {hasInterviewData && (
            <div className="bg-green-50 p-2 rounded-md flex items-center">
              <ClipboardCheck className="h-4 w-4 text-green-500 mr-2" />
              <span className="text-xs text-green-700 font-medium">Entrevista completada</span>
            </div>
          )}
          
          {/* Last call details */}
          {hasCallHistory && prospect.last_call_date && (
            <div className="bg-slate-50 p-2 rounded-md">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium">Última llamada:</span>
                <span className="text-xs">
                  {new Date(prospect.last_call_date).toLocaleDateString('es-MX', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
          )}
          
          {/* Action buttons */}
          <div className="flex space-x-1 pt-2 mt-auto">
            {onViewDetails && (
              <Button 
                variant="outline" 
                size="sm"
                className="flex-1 text-xs h-8 bg-white"
                onClick={() => onViewDetails(prospect)}
              >
                <Eye className="h-3.5 w-3.5 mr-1" />
                Detalles
              </Button>
            )}
            
            {onCall && (
              <Button 
                variant="outline" 
                size="sm"
                className="flex-1 text-xs h-8 bg-white"
                onClick={() => onCall(prospect)}
              >
                <PhoneCall className="h-3.5 w-3.5 mr-1" />
                Llamar
              </Button>
            )}
            
            {onViewCalls && hasCallHistory && (
              <Button 
                variant="outline" 
                size="sm"
                className="flex-1 text-xs h-8 bg-white"
                onClick={() => onViewCalls(prospect)}
              >
                <History className="h-3.5 w-3.5 mr-1" />
                Historial
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProspectCard;
