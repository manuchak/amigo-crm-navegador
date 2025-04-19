
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
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
  onProgressiveCall: (selectedLeadIds: number[], onProgress?: (current: number, total: number) => void) => Promise<void>;
  onPredictiveCall: (selectedLeadIds: number[], onProgress?: (current: number, total: number) => void) => Promise<void>;
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
  const [progress, setProgress] = useState<number>(0);

  // Get leads for selected estado
  const filteredLeads = leads.filter(l => l.estado === selectedState);

  // Select all logic
  const selectAllVisible = filteredLeads.length > 0;
  const allSelected = filteredLeads.length > 0 && filteredLeads.every(l => selectedLeads.includes(l.id));
  const someSelected = filteredLeads.some(l => selectedLeads.includes(l.id));

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedLeads(prev => prev.filter(id => !filteredLeads.map(l => l.id).includes(id)));
    } else {
      setSelectedLeads(prev => [
        ...prev,
        ...filteredLeads
          .filter(l => !prev.includes(l.id))
          .map(l => l.id)
      ]);
    }
  };

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
      toast({
        title: "Error",
        description: "Selecciona al menos un custodio.",
        variant: "destructive"
      });
      return;
    }
    setIsLoading(mode);
    setProgress(0);

    // Progress updater: gets called after each call (by the parent if supported)
    const handleProgress = (current: number, total: number) => {
      setProgress(Math.round((current / total) * 100));
    };

    try {
      if (mode === "progressive") {
        await onProgressiveCall(selectedLeads, handleProgress);
      } else {
        await onPredictiveCall(selectedLeads, handleProgress);
      }
      setProgress(100);
      toast({
        title: "Éxito",
        description: "Llamadas enviadas correctamente.",
        variant: "default"
      });
      onOpenChange(false);
      setTimeout(() => setProgress(0), 400); // slightly delay reset for effect
    } catch (err) {
      toast({
        title: "Error",
        description: "Error al realizar las llamadas.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(null);
      setTimeout(() => setProgress(0), 800);
    }
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setSelectedLeads([]);
      setProgress(0);
      setIsLoading(null);
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="max-w-md w-full">
        <DialogHeader>
          <DialogTitle>Llamadas Múltiples a Custodios</DialogTitle>
          <DialogDescription>
            Filtra los custodios por estado y selecciona a quiénes llamar. Elige "Progresivo" para llamar uno por uno, o "Predictivo" para llamar según la probabilidad de contacto humano.
          </DialogDescription>
        </DialogHeader>
        {/* Estado Filter */}
        <div className="mb-2">
          <Select value={selectedState} onValueChange={value => {
            setSelectedState(value);
            // Clear selection only for other states
            setSelectedLeads([]);
          }}>
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
        {/* Select All & Counter */}
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
        {/* Leads List */}
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
        {/* Progress bar */}
        {isLoading && (
          <div className="mb-2">
            <Progress value={progress} />
            <div className="text-xs text-slate-500 mt-1 text-right">{progress}% completado</div>
          </div>
        )}
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
