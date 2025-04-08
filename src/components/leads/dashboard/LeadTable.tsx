
import React from 'react';
import { Table, TableHeader, TableBody, TableRow, TableCell } from '@/components/ui/table';
import { Lead } from '@/context/LeadsContext';
import LeadTableHeader from './LeadTableHeader';
import LeadTableRow from './LeadTableRow';

interface LeadTableProps {
  leads: Lead[];
  onCall: (lead: Lead) => void;
  onViewCallLogs: (leadId: number) => void;
}

const LeadTable: React.FC<LeadTableProps> = ({ leads, onCall, onViewCallLogs }) => {
  return (
    <div className="rounded-md border border-slate-100">
      <Table>
        <TableHeader>
          <LeadTableHeader />
        </TableHeader>
        <TableBody>
          {leads.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-8 text-slate-400">
                No hay custodios registrados
              </TableCell>
            </TableRow>
          ) : (
            leads.map((lead) => (
              <LeadTableRow 
                key={lead.id} 
                lead={lead} 
                onCall={onCall} 
                onViewCallLogs={onViewCallLogs} 
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default LeadTable;
