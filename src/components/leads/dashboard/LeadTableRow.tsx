
import React from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { PhoneCall, ClipboardList, Phone } from 'lucide-react';
import { Lead } from '@/context/LeadsContext';
import LeadStatusBadge from './LeadStatusBadge';
import LeadCallCount from './LeadCallCount';

interface LeadTableRowProps {
  lead: Lead;
  onCall: (lead: Lead) => void;
  onViewCallLogs: (leadId: number) => void;
}

const LeadTableRow: React.FC<LeadTableRowProps> = ({ lead, onCall, onViewCallLogs }) => {
  return (
    <TableRow key={lead.id} className="hover:bg-slate-50">
      <TableCell className="font-medium">{lead.nombre}</TableCell>
      <TableCell className="text-sm text-slate-600">{lead.empresa}</TableCell>
      <TableCell className="text-sm text-slate-600">
        {lead.email || <span className="text-slate-400">Sin email</span>}
      </TableCell>
      <TableCell className="text-sm text-slate-600">
        {lead.telefono ? (
          <div className="flex items-center">
            <Phone className="h-3 w-3 mr-1 text-slate-400" />
            {lead.telefono}
          </div>
        ) : (
          <span className="text-slate-400">Sin teléfono</span>
        )}
      </TableCell>
      <TableCell>
        <LeadStatusBadge status={lead.estado} />
      </TableCell>
      <TableCell>
        <LeadCallCount callCount={lead.callCount} />
      </TableCell>
      <TableCell className="text-sm text-slate-600">{lead.lastCallDate || 'No hay llamadas'}</TableCell>
      <TableCell className="text-sm text-slate-600">{lead.fechaCreacion}</TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onCall(lead)}
            className="text-slate-700 hover:text-primary"
          >
            <PhoneCall className="h-4 w-4 mr-1" />
            Llamar
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onViewCallLogs(lead.id)}
            className="text-slate-700 hover:text-primary"
          >
            <ClipboardList className="h-4 w-4 mr-1" />
            Detalles
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default LeadTableRow;
