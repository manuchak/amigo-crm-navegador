
import React from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { Prospect } from '@/services/prospectService';
import { formatPhoneNumber } from '@/lib/utils';
import { Eye, PhoneCall, History, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TooltipProvider } from '@/components/ui/tooltip';
import { StatusBadge, CallInfo, VehicleInfo, SedenaInfo, DateFormatter, BooleanDisplay } from '.';

interface ProspectRowProps {
  prospect: Prospect;
  onViewDetails?: (prospect: Prospect) => void;
  onCall?: (prospect: Prospect) => void;
  onViewCalls?: (prospect: Prospect) => void;
  onValidate?: (prospect: Prospect) => void;
}

const ProspectRow: React.FC<ProspectRowProps> = ({
  prospect,
  onViewDetails,
  onCall,
  onViewCalls,
  onValidate,
}) => {
  const hasCallHistory = prospect.call_count !== null && prospect.call_count > 0;
  const hasInterviewData = prospect.transcript !== null;

  // Determine row highlight based on call status
  const getRowHighlightClass = () => {
    if (!prospect.ended_reason) return "";
    
    const status = prospect.ended_reason.toLowerCase();
    if (status.includes('completed')) return "bg-green-50/30";
    if (status.includes('no-answer')) return "bg-orange-50/30";
    if (status.includes('busy')) return "bg-yellow-50/30";
    if (status.includes('failed')) return "bg-red-50/30";
    
    return "";
  };

  return (
    <TooltipProvider>
      <TableRow 
        className={`hover:bg-slate-50 transition-colors ${getRowHighlightClass()}`}
        style={{
          borderLeft: prospect.ended_reason?.toLowerCase().includes('completed') ? '4px solid #10b981' : 
                     prospect.ended_reason?.toLowerCase().includes('no-answer') ? '4px solid #f97316' :
                     prospect.ended_reason?.toLowerCase().includes('busy') ? '4px solid #eab308' :
                     prospect.ended_reason?.toLowerCase().includes('failed') ? '4px solid #ef4444' :
                     prospect.lead_status === "Calificado" ? '4px solid #9b87f5' : '4px solid transparent'
        }}
      >
        {/* Nombre */}
        <TableCell>
          <div className="flex flex-col">
            <span className="font-medium">
              {prospect.lead_name || prospect.custodio_name || "Sin nombre"}
            </span>
            <span className="text-xs text-slate-500">
              ID: {prospect.lead_id}
            </span>
          </div>
        </TableCell>

        {/* Estado */}
        <TableCell>
          <StatusBadge status={prospect.lead_status} />
        </TableCell>

        {/* Teléfono */}
        <TableCell>
          <div className="font-mono text-sm">
            {formatPhoneNumber(prospect.lead_phone || prospect.phone_number_intl || "No disponible")}
          </div>
        </TableCell>

        {/* Llamadas */}
        <TableCell>
          <CallInfo 
            callCount={prospect.call_count}
            lastCallDate={prospect.last_call_date}
            hasInterviewData={hasInterviewData}
            endedReason={prospect.ended_reason}
          />
        </TableCell>

        {/* Vehículo */}
        <TableCell>
          <VehicleInfo 
            brand={prospect.car_brand}
            model={prospect.car_model}
            year={prospect.car_year}
          />
        </TableCell>

        {/* SEDENA */}
        <TableCell>
          <SedenaInfo sedenaId={prospect.sedena_id} />
        </TableCell>

        {/* Fecha Creación */}
        <TableCell>
          <DateFormatter dateString={prospect.lead_created_at} />
        </TableCell>

        {/* Acciones */}
        <TableCell className="text-right">
          <div className="flex justify-end space-x-1">
            {onViewDetails && (
              <Button 
                variant="ghost" 
                size="sm"
                className="h-7 text-xs"
                onClick={() => onViewDetails(prospect)}
              >
                <Eye className="h-3.5 w-3.5 mr-1" />
                Detalles
              </Button>
            )}
            
            {onCall && (
              <Button 
                variant="ghost" 
                size="sm"
                className="h-7 text-xs"
                onClick={() => onCall(prospect)}
              >
                <PhoneCall className="h-3.5 w-3.5 mr-1" />
                Llamar
              </Button>
            )}
            
            {onViewCalls && hasCallHistory && (
              <Button 
                variant="ghost" 
                size="sm"
                className="h-7 text-xs"
                onClick={() => onViewCalls(prospect)}
              >
                <History className="h-3.5 w-3.5 mr-1" />
                Historial
              </Button>
            )}
            
            {onValidate && (
              <Button 
                variant="ghost" 
                size="sm"
                className="h-7 text-xs"
                onClick={() => onValidate(prospect)}
              >
                <Check className="h-3.5 w-3.5 mr-1" />
                Validar
              </Button>
            )}
          </div>
        </TableCell>
      </TableRow>
    </TooltipProvider>
  );
};

export default ProspectRow;
