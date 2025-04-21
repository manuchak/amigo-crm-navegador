
import React from "react";
import { Lead } from "@/context/LeadsContext";

interface RecentLeadsListProps {
  leads: Lead[];
}

const RecentLeadsList: React.FC<RecentLeadsListProps> = ({ leads }) => (
  <div className="space-y-3">
    {(leads.slice(0, 3)).map((lead) => (
      <div key={lead.id} className="flex flex-col gap-1 border-b border-slate-100 pb-2 mb-1 last:border-0 last:mb-0 last:pb-0">
        <span className="font-medium">{lead.nombre}</span>
        <span className="text-xs text-slate-400">{lead.empresa}</span>
        <span className="text-xs text-slate-500">Estado: <b>{lead.estado}</b></span>
      </div>
    ))}
  </div>
);

export default RecentLeadsList;
