
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { LeadListPanelProps } from "./types";
import { Check, X } from "lucide-react";

const LeadListPanel: React.FC<LeadListPanelProps> = ({
  filteredLeads,
  selectedLeads,
  handleSelectLead,
  allSelected,
  someSelected,
  handleSelectAll,
  selectAllVisible,
  isLeadCalificado
}) => {
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-slate-600 font-medium">
          {filteredLeads.length} custodios encontrados
        </span>
        
        {selectAllVisible && (
          <div className="flex items-center space-x-2">
            <Checkbox
              id="select-all"
              checked={allSelected}
              indeterminate={someSelected}
              onCheckedChange={handleSelectAll}
            />
            <label htmlFor="select-all" className="text-sm cursor-pointer">
              Seleccionar todos
            </label>
          </div>
        )}
      </div>
      
      <ScrollArea className="h-[200px] border rounded-md p-2">
        {filteredLeads.length > 0 ? (
          <div className="space-y-2">
            {filteredLeads.map(lead => (
              <div
                key={lead.id}
                className="flex items-center justify-between border-b pb-2 last:border-0"
              >
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`lead-${lead.id}`}
                    checked={selectedLeads.includes(lead.id)}
                    onCheckedChange={() => handleSelectLead(lead.id)}
                  />
                  <div>
                    <label
                      htmlFor={`lead-${lead.id}`}
                      className="font-medium text-sm cursor-pointer"
                    >
                      {lead.nombre}
                    </label>
                    <div className="text-xs text-slate-500">
                      {lead.telefono || (lead.contacto && lead.contacto.includes('|') 
                        ? lead.contacto.split('|')[1]?.trim() 
                        : 'Sin teléfono')}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  {isLeadCalificado(lead) ? (
                    <Badge variant="outline" className="flex items-center space-x-1 bg-green-50 text-green-700 border-green-200">
                      <Check className="h-3 w-3" />
                      <span>Calificado</span>
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="flex items-center space-x-1 bg-slate-50 text-slate-700">
                      <X className="h-3 w-3" />
                      <span>No calificado</span>
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-500 text-sm">
            No se encontraron custodios con los filtros aplicados
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default LeadListPanel;
