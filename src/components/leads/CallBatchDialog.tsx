import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

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

interface ExtraLeadFilters {
  carYear?: string;
  hasSedenaId?: string;
  carType?: string;
}

const estadosLead = ["Nuevo", "Contactado", "En progreso", "Calificado", "No calificado"];
const carTypes = ["Hatchback", "Sedán", "SUV", "Pickup"];
const carYears = Array.from({length: 25}, (_, i) => `${2000+i}`);

const CallBatchDialog: React.FC<CallBatchDialogProps> = ({
  open,
  onOpenChange,
  leads,
  onProgressiveCall,
  onPredictiveCall
}) => {
  const { toast } = useToast();
  const [selectedState, setSelectedState] = useState<string>("Nuevo");
  const [selectedLeads, setSelectedLeads] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState<"progressive" | "predictive" | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [extraFilters, setExtraFilters] = useState<ExtraLeadFilters>({});

  const filteredLeads = leads.filter(l => {
    if (l.estado !== selectedState) return false;
    if (extraFilters.carYear && `${l.modelovehiculo || ""}` !== extraFilters.carYear) return false;
    if (extraFilters.hasSedenaId === "yes" && l.credencialsedena !== "sí" && l.credencialsedena !== "sí ") return false;
    if (extraFilters.hasSedenaId === "no" && (l.credencialsedena === "sí" || l.credencialsedena === "sí ")) return false;
    if (extraFilters.carType && `${l.anovehiculo || ""}` !== extraFilters.carType) return false;
    if (extraFilters.carType && extraFilters.carType === "Hatchback" && !(l.modelovehiculo || "").toLowerCase().includes("hatchback")) return false;
    if (extraFilters.carType && extraFilters.carType !== "Hatchback" && (l.modelovehiculo || "").toLowerCase().includes("hatchback")) return false;
    return true;
  });

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
      setTimeout(() => setProgress(0), 400);
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

  function isLeadCalificado(lead: any) {
    const yearOk = lead.modelovehiculo && carYears.includes(`${lead.modelovehiculo}`);
    const sedenaOk = lead.credencialsedena === "sí" || lead.credencialsedena === "sí ";
    const hatchOk =
      lead.modelovehiculo && (lead.modelovehiculo.toLowerCase().includes("hatchback") ||
      (extraFilters.carType === "Hatchback" && lead.modelovehiculo && lead.modelovehiculo.toLowerCase().includes("hatchback")));
    return yearOk && sedenaOk && hatchOk;
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="max-w-md w-full">
        <DialogHeader>
          <DialogTitle>Llamadas Múltiples a Custodios</DialogTitle>
          <DialogDescription>
            Filtra los custodios por estado y selecciona a quiénes llamar. Elige "Progresivo" para llamar uno por uno, o "Predictivo" para llamar según la probabilidad de contacto humano.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
          <div>
            <label className="text-xs font-medium">Año vehículo</label>
            <select
              className="w-full rounded border px-2 py-1 text-xs"
              value={extraFilters.carYear || ""}
              onChange={e => setExtraFilters(f => ({ ...f, carYear: e.target.value || undefined }))}
            >
              <option value="">Todos</option>
              {carYears.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium">Credencial SEDENA</label>
            <select
              className="w-full rounded border px-2 py-1 text-xs"
              value={extraFilters.hasSedenaId || ""}
              onChange={e => setExtraFilters(f => ({ ...f, hasSedenaId: e.target.value || undefined }))}
            >
              <option value="">Todos</option>
              <option value="yes">Sí</option>
              <option value="no">No</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium">Tipo de Auto</label>
            <select
              className="w-full rounded border px-2 py-1 text-xs"
              value={extraFilters.carType || ""}
              onChange={e => setExtraFilters(f => ({ ...f, carType: e.target.value || undefined }))}
            >
              <option value="">Todos</option>
              <option value="Hatchback">Hatchback</option>
              <option value="Sedán">Sedán</option>
              <option value="SUV">SUV</option>
              <option value="Pickup">Pickup</option>
            </select>
          </div>
        </div>

        <div className="mb-2">
          <Select value={selectedState} onValueChange={value => {
            setSelectedState(value);
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
