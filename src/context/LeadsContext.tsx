
import React, { createContext, useContext, useState, useEffect } from 'react';

// Types
export interface Lead {
  id: number;
  nombre: string;
  empresa: string;
  contacto: string;
  estado: string;
  fechaCreacion: string;
}

// Default leads data
const defaultLeads = [
  { id: 1, nombre: 'Carlos Rodríguez', empresa: 'Tecno Solutions', contacto: 'carlos@tecnosolutions.com', estado: 'Nuevo', fechaCreacion: '2023-10-15' },
  { id: 2, nombre: 'María García', empresa: 'Innovación Digital', contacto: 'maria@innovaciondigital.com', estado: 'En progreso', fechaCreacion: '2023-10-10' },
  { id: 3, nombre: 'Juan López', empresa: 'Sistemas Avanzados', contacto: 'juan@sistemasavanzados.com', estado: 'Contactado', fechaCreacion: '2023-10-05' },
  { id: 4, nombre: 'Ana Martínez', empresa: 'Data Insights', contacto: 'ana@datainsights.com', estado: 'Calificado', fechaCreacion: '2023-09-28' },
  { id: 5, nombre: 'Roberto Sánchez', empresa: 'Cloud Services', contacto: 'roberto@cloudservices.com', estado: 'Nuevo', fechaCreacion: '2023-09-20' },
];

interface LeadsContextType {
  leads: Lead[];
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
  updateLeadStatus: (leadId: number, newStatus: string) => void;
  addLead: (lead: Lead) => void;
}

const LeadsContext = createContext<LeadsContextType | undefined>(undefined);

export const useLeads = () => {
  const context = useContext(LeadsContext);
  if (!context) {
    throw new Error('useLeads must be used within a LeadsProvider');
  }
  return context;
};

export const LeadsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [leads, setLeads] = useState<Lead[]>(defaultLeads);
  
  // Load leads from localStorage on first render
  useEffect(() => {
    const savedLeads = localStorage.getItem('leads');
    if (savedLeads) {
      setLeads(JSON.parse(savedLeads));
    }
  }, []);

  // Save leads to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('leads', JSON.stringify(leads));
  }, [leads]);

  // Function to update lead status
  const updateLeadStatus = (leadId: number, newStatus: string) => {
    setLeads(prevLeads => 
      prevLeads.map(lead => 
        lead.id === leadId ? { ...lead, estado: newStatus } : lead
      )
    );
  };

  // Function to add a new lead
  const addLead = (lead: Lead) => {
    setLeads(prevLeads => [lead, ...prevLeads]);
  };

  return (
    <LeadsContext.Provider value={{ leads, setLeads, updateLeadStatus, addLead }}>
      {children}
    </LeadsContext.Provider>
  );
};
