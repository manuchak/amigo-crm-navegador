
import React from 'react';
import { Table, TableHeader, TableBody, TableRow, TableCell } from '@/components/ui/table';
import { Lead } from '@/context/LeadsContext';
import LeadTableHeader from './LeadTableHeader';
import LeadTableRow from './LeadTableRow';
import LeadCard from './LeadCard';

interface LeadTableProps {
  leads: Lead[];
  onCall: (lead: Lead) => void;
  onViewCallLogs: (leadId: number) => void;
  view?: "list" | "cards";
}

const LeadTable: React.FC<LeadTableProps> = ({ 
  leads, 
  onCall, 
  onViewCallLogs,
  view = "list" 
}) => {
  if (view === "cards") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {leads.length === 0 ? (
          <div className="col-span-full flex items-center justify-center py-8 text-slate-400">
            No hay custodios registrados
          </div>
        ) : (
          leads.map((lead) => (
            <LeadCard 
              key={lead.id}
              lead={lead}
              onCall={onCall}
              onViewCallLogs={onViewCallLogs}
            />
          ))
        )}
      </div>
    );
  }

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
