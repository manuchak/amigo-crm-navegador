
export type LeadFilter = 'all' | 'armed' | 'vehicle' | 'unassigned' | 'assigned' | 'mine';

export interface LeadForInterview {
  id: number;
  nombre: string;
  telefono: string;
  email: string;
  empresa: string;
  estado: string;
  experienciaseguridad: string | null;
  tienevehiculo: string | null;
  esarmado: string | null;
  credencialsedena: string | null;
  call_count: number;
  last_call_date: string | null;
  created_at: string;
  fecha_creacion: string;
  modelovehiculo: string | null;
  anovehiculo: string | null;
  assigned_to: string | null;
  assigned_at: string | null;
  assignee_name?: string | null;
}

export interface StaffUser {
  uid: string;
  displayName: string;
  email: string;
  role: string;
}

export interface UseLeadInterviewsReturn {
  leads: LeadForInterview[];
  newLeads: LeadForInterview[];
  classifiedLeads: LeadForInterview[];
  scheduledLeads: LeadForInterview[];
  unassignedLeads: LeadForInterview[];
  assignedLeads: LeadForInterview[];
  myLeads: LeadForInterview[];
  loading: boolean;
  filter: LeadFilter;
  setFilter: (filter: LeadFilter) => void;
  fetchLeads: () => Promise<void>;
  updateLeadStatus: (leadId: number, newStatus: string) => Promise<void>;
  classifyLead: (leadId: number, type: 'armed' | 'vehicle') => Promise<void>;
  assignLead: (leadId: number, userId: string) => Promise<void>;
  unassignLead: (leadId: number) => Promise<void>;
  staffUsers: StaffUser[];
  loadingStaff: boolean;
  isSupplyAdmin: boolean;
  isSupply: boolean;
}
