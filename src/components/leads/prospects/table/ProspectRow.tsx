
import React from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { Prospect } from '@/services/prospectService';
import { formatPhoneNumber, normalizeCallStatus } from '@/lib/utils';
import { TooltipProvider } from '@/components/ui/tooltip';
import { StatusBadge, CallInfo, VehicleInfo, SedenaInfo, DateFormatter, BooleanDisplay, ActionButtons } from '.';

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
  const normalizedStatus = normalizeCallStatus(prospect.ended_reason);

  // Determine row highlight based on call status
  const getBorderClass = () => {
    if (!normalizedStatus) {
      return prospect.lead_status === "Calificado" ? 'border-l-4 border-l-purple-400' : '';
    }
    
    switch (normalizedStatus) {
      case 'completed':
        return "border-l-4 border-l-green-400";
      case 'no-answer':
        return "border-l-4 border-l-orange-400";
      case 'busy':
        return "border-l-4 border-l-yellow-400";
      case 'failed':
        return "border-l-4 border-l-red-400";
      default:
        return "";
    }
  };

  return (
    <TooltipProvider>
      <TableRow 
        className={`hover:bg-slate-50/80 transition-colors ${getBorderClass()}`}
      >
        {/* Nombre */}
        <TableCell className="font-medium">
          <div className="flex flex-col">
            <span className="text-sm">
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

        {/* Teléfono - Single-line display with consistent styling */}
        <TableCell>
          <div className="text-sm font-medium text-slate-700 whitespace-nowrap">
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
          <ActionButtons 
            prospect={prospect}
            onViewDetails={onViewDetails}
            onCall={onCall}
            onViewCalls={onViewCalls}
            onValidate={onValidate}
            hasCallHistory={hasCallHistory}
            hasInterviewData={hasInterviewData}
          />
        </TableCell>
      </TableRow>
    </TooltipProvider>
  );
};

export default ProspectRow;
