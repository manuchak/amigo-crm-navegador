
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

type Lead = {
  id: number;
  nombre: string;
  telefono?: string;
  contacto?: string;
  estado: string;
};

interface CallBatchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leads: Lead[];
  onProgressiveCall: (selectedLeadIds: number[]) => Promise<void>;
  onPredictiveCall: (selectedLeadIds: number[]) => Promise<void>;
}

const estadosLead = ["Nuevo", "Contactado", "En progreso", "Calificado", "No calificado"];

const CallBatchDialog: React.FC<CallBatchDialogProps> = ({
  open,
  onOpenChange,
  leads,
  onProgressiveCall,
  onPredictiveCall
}) => {
  const [selectedState, setSelectedState] = useState<string>("Nuevo");
  const [selectedLeads, setSelectedLeads] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState<"progressive" | "predictive" | null>(null);

  // Get leads for selected estado
  const filteredLeads = leads.filter(l => l.estado === selectedState);

  const handleSelectLead = (leadId: number) => {
    setSelectedLeads(prev =>
      prev.includes(leadId)
        ? prev.filter(id => id !== leadId)
        : [...prev, leadId]
    );
  };

  // Start batch - progressive or predictive
  const handleBatchCall = async (mode: "progressive" | "predictive") => {
    if (selectedLeads.length === 0) {
      toast.error("Selecciona al menos un custodio.");
      return;
    }
    setIsLoading(mode);

    try {
      if (mode === "progressive") {
        await onProgressiveCall(selectedLeads);
      } else {
        await onPredictiveCall(selectedLeads);
      }
      toast.success("Llamadas enviadas correctamente.");
      onOpenChange(false);
    } catch (err) {
      toast.error("Error al realizar las llamadas.");
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-full">
        <DialogHeader>
          <DialogTitle>Llamadas Múltiples a Custodios</DialogTitle>
          <DialogDescription>
            Filtra los custodios por estado y selecciona a quiénes llamar. Elige "Progresivo" para llamar uno por uno, o "Predictivo" para llamar según la probabilidad de contacto humano.
          </DialogDescription>
        </DialogHeader>
        <div className="mb-2">
          <Select value={selectedState} onValueChange={setSelectedState}>
            <SelectTrigger aria-label="Filtrar por estado">
              <SelectValue placeholder="Selecciona estado del custodio" />
            </SelectTrigger>
            <SelectContent>
              {estadosLead.map(estado => (
                <SelectItem key={estado} value={estado}>
                  {estado}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="max-h-44 overflow-y-auto border rounded mb-2 p-2 bg-slate-50">
          {filteredLeads.length === 0 && <p className="text-xs text-slate-400">No hay custodios para este estado.</p>}
          {filteredLeads.map(lead => (
            <div key={lead.id} className="flex items-center gap-2 py-1">
              <input
                type="checkbox"
                checked={selectedLeads.includes(lead.id)}
                onChange={() => handleSelectLead(lead.id)}
                className="accent-primary"
                id={`lead-${lead.id}`}
              />
              <label htmlFor={`lead-${lead.id}`} className="text-sm font-medium cursor-pointer">{lead.nombre}</label>
              <span className="ml-auto text-xs text-slate-400">{lead.telefono || lead.contacto || "-"}</span>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button
            onClick={() => handleBatchCall("progressive")}
            disabled={isLoading !== null}
            className="w-full"
            type="button"
          >
            {isLoading === "progressive" ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
            Llamada Progresiva
          </Button>
          <Button
            onClick={() => handleBatchCall("predictive")}
            disabled={isLoading !== null}
            className="w-full"
            type="button"
            variant="outline"
          >
            {isLoading === "predictive" ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
            Llamada Predictiva
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CallBatchDialog;
