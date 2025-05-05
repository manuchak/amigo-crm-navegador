
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LeadListPanelProps } from "./types";
import { Badge } from "@/components/ui/badge";

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
    <div className="space-y-2 py-2">
      <div className="font-medium text-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          {selectAllVisible && (
            <Checkbox
              id="select-all"
              className="mr-2"
              checked={allSelected}
              ref={(ref) => {
                // We need to cast this to HTMLInputElement because indeterminate is a property of input elements, not button elements
                if (ref) {
                  (ref as unknown as HTMLInputElement).indeterminate = someSelected && !allSelected;
                }
              }}
              onCheckedChange={handleSelectAll}
            />
          )}
          <span>Custodios disponibles ({filteredLeads.length})</span>
        </div>
        {selectedLeads.length > 0 && (
          <Badge variant="secondary" className="ml-2">
            {selectedLeads.length} seleccionados
          </Badge>
        )}
      </div>

      <ScrollArea className="h-[180px] border rounded-md p-2">
        {filteredLeads.length > 0 ? (
          <div className="space-y-2">
            {filteredLeads.map((lead) => (
              <div
                key={lead.id}
                className={`flex items-center py-1.5 px-2 rounded-md ${
                  selectedLeads.includes(lead.id)
                    ? "bg-primary/5"
                    : "hover:bg-muted"
                }`}
              >
                <Checkbox
                  id={`lead-${lead.id}`}
                  className="mr-2"
                  checked={selectedLeads.includes(lead.id)}
                  onCheckedChange={() => handleSelectLead(lead.id)}
                />
                <label
                  htmlFor={`lead-${lead.id}`}
                  className="flex-1 cursor-pointer text-sm flex items-center justify-between"
                >
                  <span className="truncate">{lead.nombre}</span>
                  {isLeadCalificado(lead) && (
                    <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200 text-xs">
                      Calificado
                    </Badge>
                  )}
                </label>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
            No hay custodios que coincidan con los filtros
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default LeadListPanel;
