
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Prospect } from '@/services/prospectService';
import { formatPhoneNumber } from '@/lib/utils';
import StatusBadge from './StatusBadge';
import VehicleInfo from './VehicleInfo';
import SedenaInfo from './SedenaInfo';
import CallInfo from './CallInfo';
import ActionButtons from './ActionButtons';

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
  onValidate
}) => {
  const hasCallHistory = prospect.call_count !== null && prospect.call_count > 0;
  const hasInterviewData = prospect.transcript !== null;

  return (
    <TableRow key={`prospect-${prospect.lead_id}-${prospect.validated_lead_id}`}>
      <TableCell>
        <div className="font-medium">{prospect.lead_name || prospect.custodio_name || "Sin nombre"}</div>
        <div className="text-sm text-slate-500">
          Creado: {new Date(prospect.lead_created_at || '').toLocaleDateString('es-MX', { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </TableCell>
      <TableCell>
        {formatPhoneNumber(prospect.lead_phone || prospect.phone_number_intl || "No disponible")}
        {prospect.lead_email && (
          <div className="text-xs text-slate-500">{prospect.lead_email}</div>
        )}
      </TableCell>
      <TableCell>
        <StatusBadge status={prospect.lead_status} />
      </TableCell>
      <TableCell>
        <VehicleInfo 
          brand={prospect.car_brand} 
          model={prospect.car_model} 
          year={prospect.car_year} 
        />
      </TableCell>
      <TableCell>
        <SedenaInfo 
          sedenaId={prospect.sedena_id}
          hasSecurityExperience={prospect.has_security_experience}
          hasFirearmLicense={prospect.has_firearm_license}
        />
      </TableCell>
      <TableCell>
        <CallInfo 
          callCount={prospect.call_count}
          lastCallDate={prospect.last_call_date}
          hasInterviewData={hasInterviewData}
        />
      </TableCell>
      <TableCell>
        <ActionButtons 
          prospect={prospect}
          onViewDetails={onViewDetails}
          onCall={onCall}
          onViewCalls={onViewCalls}
          onValidate={onValidate}
          hasCallHistory={hasCallHistory}
        />
      </TableCell>
    </TableRow>
  );
};

export default ProspectRow;
