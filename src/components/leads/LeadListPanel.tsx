
import React from "react";

type Lead = {
  id: number;
  nombre: string;
  telefono?: string;
  contacto?: string;
  estado: string;
  modelovehiculo?: string | null;
  credencialsedena?: string | null;
  anovehiculo?: string | null;
};

interface LeadListPanelProps {
  filteredLeads: Lead[];
  selectedLeads: number[];
  handleSelectLead: (leadId: number) => void;
  allSelected: boolean;
  someSelected: boolean;
  handleSelectAll: () => void;
  selectAllVisible: boolean;
  isLeadCalificado: (lead: Lead) => boolean;
}

const LeadListPanel: React.FC<LeadListPanelProps> = ({
  filteredLeads,
  selectedLeads,
  handleSelectLead,
  allSelected,
  someSelected,
  handleSelectAll,
  selectAllVisible,
  isLeadCalificado,
}) => {
  return (
    <>
      <div className="flex items-center mb-2 gap-2">
        {selectAllVisible && (
          <input
            type="checkbox"
            className="accent-primary"
            checked={allSelected}
            ref={el => {
              if (el) el.indeterminate = !allSelected && someSelected;
            }}
            onChange={handleSelectAll}
            id="select-all-leads"
          />
        )}
        {selectAllVisible && (
          <label htmlFor="select-all-leads" className="text-sm font-medium cursor-pointer">
            Seleccionar todos
          </label>
        )}
        <span className="ml-auto text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-semibold">
          {selectedLeads.length} llamada{selectedLeads.length !== 1 && "s"} seleccionada{selectedLeads.length !== 1 && "s"}
        </span>
      </div>
      <div className="max-h-44 overflow-y-auto border rounded mb-2 p-2 bg-slate-50">
        {filteredLeads.length === 0 && <p className="text-xs text-slate-400">No hay custodios para este estado y filtro.</p>}
        {filteredLeads.map(lead => {
          const calificado = isLeadCalificado(lead);
          return (
            <div key={lead.id} className={`flex items-center gap-2 py-1 ${calificado ? "bg-green-50 border-green-300 border-l-4" : ""}`}>
              <input
                type="checkbox"
                checked={selectedLeads.includes(lead.id)}
                onChange={() => handleSelectLead(lead.id)}
                className="accent-primary"
                id={`lead-${lead.id}`}
              />
              <label htmlFor={`lead-${lead.id}`} className="text-sm font-medium cursor-pointer">
                {lead.nombre}{" "}
                {calificado && <span className="ml-1 text-green-600 text-xs font-bold">Calificado</span>}
              </label>
              <span className="ml-auto text-xs text-slate-400">{lead.telefono || lead.contacto || "-"}</span>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default LeadListPanel;

