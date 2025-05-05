
export type Lead = {
  id: number;
  nombre: string;
  telefono?: string;
  contacto?: string;
  estado: string;
  modelovehiculo?: string | null;
  credencialsedena?: string | null;
  anovehiculo?: string | null;
};

export type CallBatchDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leads: Lead[];
  onProgressiveCall: (selectedLeadIds: number[], onProgress?: (current: number, total: number) => void) => Promise<void>;
  onPredictiveCall: (selectedLeadIds: number[], onProgress?: (current: number, total: number) => void) => Promise<void>;
};

export type ExtraLeadFilters = {
  carYear?: string;
  hasSedenaId?: string;
  carType?: string;
  fromYear?: number;
  toYear?: number;
  selectedYears?: number[];
};

export type LeadFilterSectionProps = {
  carMinYear: number;
  carMaxYear: number;
  selectedState: string;
  setSelectedState: (state: string) => void;
  extraFilters: ExtraLeadFilters;
  setExtraFilters: (filters: ExtraLeadFilters) => void;
};

export type LeadListPanelProps = {
  filteredLeads: Lead[];
  selectedLeads: number[];
  handleSelectLead: (leadId: number) => void;
  allSelected: boolean;
  someSelected: boolean;
  handleSelectAll: () => void;
  selectAllVisible: boolean;
  isLeadCalificado: (lead: Lead) => boolean;
};

export type BatchProgressBarProps = {
  isLoading: "progressive" | "predictive" | null;
  progress: number;
};

export type BatchActionButtonsProps = {
  handleBatchCall: (mode: "progressive" | "predictive") => Promise<void>;
  isLoading: "progressive" | "predictive" | null;
};
