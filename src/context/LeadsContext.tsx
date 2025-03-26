
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

interface LeadsContextType {
  leads: Lead[];
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
  updateLeadStatus: (leadId: number, newStatus: string) => void;
  addLead: (lead: Lead) => void;
  deleteLead: (leadId: number) => void;
}

// Leads demo para desarrollo
const defaultLeads = [
  { id: 1, nombre: 'Carlos Rodríguez', empresa: 'Custodio (armado)', contacto: 'carlos@ejemplo.com | +525512345678', estado: 'Nuevo', fechaCreacion: '2023-10-15' },
  { id: 2, nombre: 'María García', empresa: 'Custodio (con vehículo)', contacto: 'maria@ejemplo.com | +525587654321', estado: 'Contactado', fechaCreacion: '2023-10-10' },
  { id: 3, nombre: 'Juan López', empresa: 'Custodio (con vehículo y armado)', contacto: 'juan@ejemplo.com | +525599887766', estado: 'Calificado', fechaCreacion: '2023-10-05' },
  { id: 4, nombre: 'Ana Martínez', empresa: 'Custodio', contacto: 'ana@ejemplo.com | +525566778899', estado: 'Rechazado', fechaCreacion: '2023-09-28' },
  { id: 5, nombre: 'Roberto Sánchez', empresa: 'Custodio (armado)', contacto: 'roberto@ejemplo.com | +525544332211', estado: 'Nuevo', fechaCreacion: '2023-09-20' },
];

const LeadsContext = createContext<LeadsContextType | undefined>(undefined);

export const useLeads = () => {
  const context = useContext(LeadsContext);
  if (!context) {
    throw new Error('useLeads debe ser usado dentro de un LeadsProvider');
  }
  return context;
};

export const LeadsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [leads, setLeads] = useState<Lead[]>(defaultLeads);
  
  // Cargar leads desde localStorage al iniciar
  useEffect(() => {
    const savedLeads = localStorage.getItem('leads');
    if (savedLeads) {
      setLeads(JSON.parse(savedLeads));
    }
  }, []);

  // Guardar leads en localStorage cuando cambien
  useEffect(() => {
    localStorage.setItem('leads', JSON.stringify(leads));
  }, [leads]);

  // Actualizar estado de un lead
  const updateLeadStatus = (leadId: number, newStatus: string) => {
    setLeads(prevLeads => 
      prevLeads.map(lead => 
        lead.id === leadId ? { ...lead, estado: newStatus } : lead
      )
    );
  };

  // Añadir nuevo lead
  const addLead = (lead: Lead) => {
    setLeads(prevLeads => [lead, ...prevLeads]);
  };

  // Eliminar lead
  const deleteLead = (leadId: number) => {
    setLeads(prevLeads => prevLeads.filter(lead => lead.id !== leadId));
  };

  return (
    <LeadsContext.Provider value={{ 
      leads, 
      setLeads, 
      updateLeadStatus, 
      addLead,
      deleteLead
    }}>
      {children}
    </LeadsContext.Provider>
  );
};
