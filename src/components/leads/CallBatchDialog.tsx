import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import LeadFilterSection from "./LeadFilterSection";
import LeadListPanel from "./LeadListPanel";

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
  fromYear?: number;
  toYear?: number;
  selectedYears?: number[];
}

const estadosLead = ["Nuevo", "Contactado", "En progreso", "Calificado", "No calificado"];
const carTypes = ["Hatchback", "Sedán", "SUV", "Pickup"];
const currentYear = new Date().getFullYear();
const carMinYear = currentYear - 9;
const carMaxYear = currentYear;
const carYears = Array.from({ length: 10 }, (_, i) => `${carMaxYear - i}`);

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
  const [extraFilters, setExtraFilters] = useState<ExtraLeadFilters & { selectedYears?: number[]; fromYear?: number; toYear?: number }>({});

  const filteredLeads = leads.filter(l => {
    if (l.estado !== selectedState) return false;

    const lVehicleYear = typeof l.modelovehiculo === "string" ? parseInt(l.modelovehiculo, 10) : undefined;
    if (
      Array.isArray(extraFilters.selectedYears) && extraFilters.selectedYears.length > 0
    ) {
      if (l.modelovehiculo && !extraFilters.selectedYears.includes(lVehicleYear!)) return false;
    } else if (
      typeof extraFilters.fromYear === "number" &&
      typeof extraFilters.toYear === "number"
    ) {
      if (l.modelovehiculo && (lVehicleYear! < extraFilters.fromYear || lVehicleYear! > extraFilters.toYear))
        return false;
    }

    if (extraFilters.hasSedenaId === "yes" && l.credencialsedena !== null && l.credencialsedena !== undefined && l.credencialsedena.trim().toLowerCase() !== "sí") return false;
    if (extraFilters.hasSedenaId === "no" && l.credencialsedena !== null && l.credencialsedena !== undefined && l.credencialsedena.trim().toLowerCase() === "sí") return false;

    if (extraFilters.carType && l.modelovehiculo) {
      if (extraFilters.carType === "Hatchback") {
        if (!l.modelovehiculo.toLowerCase().includes("hatchback")) return false;
      } else {
        if (l.modelovehiculo.toLowerCase().includes("hatchback")) return false;
      }
    }
    return true;
  });

  const allFilteredIds = filteredLeads.map(l => l.id);
  const allSelected = allFilteredIds.length > 0 && allFilteredIds.every(id => selectedLeads.includes(id));
  const someSelected = allFilteredIds.some(id => selectedLeads.includes(id)) && !allSelected;
  const selectAllVisible = filteredLeads.length > 0;

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedLeads(prev => prev.filter(id => !allFilteredIds.includes(id)));
    } else {
      setSelectedLeads(prev => [
        ...prev,
        ...allFilteredIds.filter(id => !prev.includes(id))
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

  function isLeadCalificado(lead: Lead) {
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
        <LeadFilterSection
          carMinYear={carMinYear}
          carMaxYear={carMaxYear}
          selectedState={selectedState}
          setSelectedState={setSelectedState}
          extraFilters={extraFilters}
          setExtraFilters={setExtraFilters}
        />
        <LeadListPanel
          filteredLeads={filteredLeads}
          selectedLeads={selectedLeads}
          handleSelectLead={handleSelectLead}
          allSelected={allSelected}
          someSelected={someSelected}
          handleSelectAll={handleSelectAll}
          selectAllVisible={selectAllVisible}
          isLeadCalificado={isLeadCalificado}
        />
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
