
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Prospect } from '@/services/prospectService';
import { formatPhoneNumber } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Phone, Car, Shield, ClipboardCheck, Calendar, Mail } from 'lucide-react';
import { ActionButtons } from './table';
import { StatusBadge } from './table';
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

  // Generate status color based on ended_reason
  const getEndedReasonColor = (reason: string | null | undefined): string => {
    if (!reason) return "bg-gray-200 text-gray-700";
    
    const reasonLower = reason.toLowerCase();
    
    if (reasonLower.includes('completed') || reasonLower.includes('completado')) {
      return "bg-green-50 text-green-700 border border-green-200";
    } 
    else if (reasonLower.includes('answered') || reasonLower.includes('contestado')) {
      return "bg-blue-50 text-blue-700 border border-blue-200";
    }
    else if (reasonLower.includes('busy') || reasonLower.includes('ocupado')) {
      return "bg-yellow-50 text-yellow-700 border border-yellow-200";
    } 
    else if (reasonLower.includes('no-answer') || reasonLower.includes('no contestado') || reasonLower.includes('missing')) {
      return "bg-orange-50 text-orange-700 border border-orange-200";
    }
    else if (reasonLower.includes('failed') || reasonLower.includes('fallido') || reasonLower.includes('error')) {
      return "bg-red-50 text-red-700 border border-red-200";
    }
    
    return "bg-gray-100 text-gray-700";
  };

  const getBorderColor = () => {
    if (!prospect.ended_reason) {
      return prospect.lead_status === "Calificado" ? "border-l-purple-400" : "";
    }
    
    const reasonLower = prospect.ended_reason.toLowerCase();
    if (reasonLower.includes('completed')) return "border-l-green-400";
    if (reasonLower.includes('no-answer')) return "border-l-orange-400";
    if (reasonLower.includes('busy')) return "border-l-yellow-400";
    if (reasonLower.includes('failed')) return "border-l-red-400";
    
    return "";
  };

  return (
    <TooltipProvider>
      <Card 
        className={`h-full border shadow-sm hover:shadow-md transition-all border-l-4 ${getBorderColor()}`}
      >
        <CardContent className="p-4">
          <div className="flex flex-col space-y-3">
            {/* Header section with name and status */}
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-sm truncate" title={prospect.lead_name || prospect.custodio_name || "Sin nombre"}>
                  {prospect.lead_name || prospect.custodio_name || "Sin nombre"}
                </h3>
                <p className="text-xs text-slate-500">
                  ID: {prospect.lead_id}
                </p>
              </div>
              <StatusBadge status={prospect.lead_status || "Nuevo"} />
            </div>
            
            {/* Contact information */}
            <div className="space-y-2">
              <div className="flex items-center text-xs">
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
            
            {/* Call status - prominently displayed */}
            {prospect.ended_reason && (
              <div>
                <Badge 
                  variant="outline" 
                  className={`w-full flex justify-center py-1 text-xs ${getEndedReasonColor(prospect.ended_reason)}`}
                >
                  {prospect.ended_reason}
                </Badge>
              </div>
            )}

            {/* Call stats */}
            {hasCallHistory && (
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Llamadas:</span>
                <span className="font-medium">{prospect.call_count || 0}</span>
              </div>
            )}
            
            {/* Vehicle info */}
            <div className="bg-slate-50 rounded-md p-2 space-y-2">
              <div className="flex flex-col">
                <div className="flex items-center text-xs text-slate-500">
                  <Car className="h-3.5 w-3.5 mr-1" />
                  <span>Vehículo</span>
                </div>
                <p className="text-xs truncate pl-5">
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
                <div className="flex items-center text-xs text-slate-500">
                  <Shield className="h-3.5 w-3.5 mr-1" />
                  <span>SEDENA</span>
                </div>
                <p className="text-xs truncate pl-5">
                  {prospect.sedena_id || <span className="text-slate-400">Sin ID</span>}
                </p>
              </div>
              
              <div className="flex flex-col">
                <div className="flex items-center text-xs text-slate-500">
                  <Calendar className="h-3.5 w-3.5 mr-1" />
                  <span>Creación</span>
                </div>
                <p className="text-xs truncate pl-5">
                  {prospect.lead_created_at ? (
                    new Date(prospect.lead_created_at).toLocaleDateString('es-MX', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })
                  ) : (
                    <span className="text-slate-400">Fecha desconocida</span>
                  )}
                </p>
              </div>
            </div>

            {/* Display interview completion indicator */}
            {hasInterviewData && (
              <div className="bg-green-50 p-2 rounded-md flex items-center">
                <ClipboardCheck className="h-3.5 w-3.5 text-green-600 mr-2" />
                <span className="text-xs text-green-700">Entrevista completada</span>
              </div>
            )}
            
            {/* Action buttons */}
            <div className="border-t pt-3 mt-auto">
              <ActionButtons 
                prospect={prospect}
                onViewDetails={onViewDetails}
                onCall={onCall}
                onViewCalls={onViewCalls}
                onValidate={onValidate}
                hasCallHistory={hasCallHistory}
                hasInterviewData={hasInterviewData}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

export default ProspectCard;
