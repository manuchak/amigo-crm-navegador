
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Prospect } from '@/services/prospectService';
import { formatPhoneNumber } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Phone, Car, Shield, ClipboardCheck, Eye, PhoneCall, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';

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

  // Generate a appropriate color based on the ended_reason
  const getEndedReasonColor = (reason: string | null | undefined): string => {
    if (!reason) return "bg-gray-200 text-gray-700";
    
    const reasonLower = reason.toLowerCase();
    
    if (reasonLower.includes('completed') || reasonLower.includes('completado')) {
      return "bg-green-100 text-green-800";
    } 
    else if (reasonLower.includes('answered') || reasonLower.includes('contestado')) {
      return "bg-blue-100 text-blue-800";
    }
    else if (reasonLower.includes('busy') || reasonLower.includes('ocupado')) {
      return "bg-yellow-100 text-yellow-800";
    } 
    else if (reasonLower.includes('no-answer') || reasonLower.includes('no contestado') || reasonLower.includes('missing')) {
      return "bg-orange-100 text-orange-800";
    }
    else if (reasonLower.includes('failed') || reasonLower.includes('fallido') || reasonLower.includes('error')) {
      return "bg-red-100 text-red-800";
    }
    
    return "bg-gray-200 text-gray-700";
  };

  return (
    <Card className="h-full">
      <CardContent className="p-4">
        <div className="flex flex-col space-y-4">
          <div>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium truncate">
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
                className="text-xs"
              >
                {prospect.lead_status || "Nuevo"}
              </Badge>
            </div>
            
            <p className="text-xs text-slate-500 mt-1">
              Creado: {new Date(prospect.lead_created_at || '').toLocaleDateString('es-MX', { 
                year: 'numeric', 
                month: '2-digit', 
                day: '2-digit',
              })}
            </p>
          </div>
          
          <div className="flex flex-col space-y-2">
            <div className="flex items-center text-sm">
              <Phone className="h-3.5 w-3.5 mr-2 text-slate-400" />
              <span className="font-mono">
                {formatPhoneNumber(prospect.lead_phone || prospect.phone_number_intl || "No disponible")}
              </span>
            </div>
            
            {prospect.lead_email && (
              <div className="text-xs text-slate-600 ml-5.5">
                {prospect.lead_email}
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col space-y-1">
              <div className="flex items-center text-xs text-slate-600">
                <Car className="h-3.5 w-3.5 mr-1 text-slate-400" />
                <span>Vehículo</span>
              </div>
              <p className="text-xs">
                {prospect.car_brand ? (
                  <>
                    {prospect.car_brand} {prospect.car_model} {prospect.car_year}
                  </>
                ) : (
                  <span className="text-slate-400">No registrado</span>
                )}
              </p>
            </div>
            
            <div className="flex flex-col space-y-1">
              <div className="flex items-center text-xs text-slate-600">
                <Shield className="h-3.5 w-3.5 mr-1 text-slate-400" />
                <span>SEDENA</span>
              </div>
              <p className="text-xs">
                {prospect.sedena_id ? (
                  prospect.sedena_id
                ) : (
                  <span className="text-slate-400">Sin ID</span>
                )}
              </p>
            </div>
          </div>
          
          <div className="flex flex-col space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-xs text-slate-600">
                <Phone className="h-3.5 w-3.5 mr-1 text-slate-400" />
                <span>Llamadas</span>
                
                {hasInterviewData && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="ml-1">
                          <ClipboardCheck className="h-3.5 w-3.5 text-green-500" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">Entrevista completada</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              
              <Badge variant="outline" className="text-xs">
                {prospect.call_count || 0}
              </Badge>
            </div>
            
            {prospect.last_call_date && (
              <p className="text-xs text-slate-500">
                Última: {new Date(prospect.last_call_date).toLocaleDateString('es-MX', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                })}
              </p>
            )}
            
            {prospect.ended_reason && (
              <Badge 
                variant="outline" 
                className={`text-xs font-normal px-2 py-0.5 mt-1 ${getEndedReasonColor(prospect.ended_reason)}`}
              >
                {prospect.ended_reason}
              </Badge>
            )}
          </div>
          
          <div className="flex space-x-2 pt-2 mt-auto">
            {onViewDetails && (
              <Button 
                variant="outline" 
                size="sm"
                className="flex-1 text-xs h-8"
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
                className="flex-1 text-xs h-8"
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
                className="flex-1 text-xs h-8"
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
