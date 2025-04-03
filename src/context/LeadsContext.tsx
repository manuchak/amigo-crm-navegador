import React, { createContext, useContext, useState, useEffect } from 'react';
import * as leadService from '@/services/leadService';
import { toast } from 'sonner';

// Updated Lead interface to match Supabase schema
export interface Lead {
  id: number;
  nombre: string;
  empresa: string;
  contacto: string;
  estado: string;
  fechaCreacion: string;
  email?: string;
  telefono?: string;
  tieneVehiculo?: string;
  experienciaSeguridad?: string;
  esMilitar?: string;
  callCount?: number;
  lastCallDate?: string;
  valor?: number;
}

interface LeadsContextType {
  leads: Lead[];
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
  updateLeadStatus: (leadId: number, newStatus: string) => void;
  addLead: (lead: Lead) => void;
  deleteLead: (leadId: number) => void;
  loading: boolean;
  error: string | null;
  refetchLeads: () => Promise<void>;
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
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Cargar leads desde Supabase al iniciar
  const fetchLeads = async () => {
    setLoading(true);
    try {
      const fetchedLeads = await leadService.getLeads();
      
      // Transform the data to match our Lead interface
      const transformedLeads = fetchedLeads.map((item: any) => {
        const contactInfo = item.email || item.telefono ? 
          `${item.email || ''} | ${item.telefono || ''}`.trim() : 
          'Sin contacto';

        return {
          id: item.id,
          nombre: item.nombre || 'Sin nombre',
          empresa: item.empresa || 'Custodio',
          contacto: contactInfo,
          estado: item.estado || 'Nuevo',
          fechaCreacion: item.fechaCreacion || new Date().toISOString().split('T')[0],
          email: item.email,
          telefono: item.telefono,
          tieneVehiculo: item.tieneVehiculo,
          experienciaSeguridad: item.experienciaSeguridad,
          esMilitar: item.esMilitar,
          callCount: item.callCount || 0,
          lastCallDate: item.lastCallDate
        };
      });
      
      setLeads(transformedLeads);
      setError(null);
    } catch (err) {
      console.error('Error al cargar leads desde Supabase:', err);
      setError('Error al cargar leads. Usando datos de demostración.');
      
      // Cargar leads de demostración si falla la carga desde Supabase
      const savedLeads = localStorage.getItem('leads');
      if (savedLeads) {
        setLeads(JSON.parse(savedLeads));
      } else {
        setLeads(defaultLeads);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  // Actualizar estado de un lead
  const updateLeadStatus = async (leadId: number, newStatus: string) => {
    try {
      await leadService.updateLeadStatus(leadId, newStatus);
      
      // Actualizar estado local
      setLeads(prevLeads => 
        prevLeads.map(lead => 
          lead.id === leadId ? { ...lead, estado: newStatus } : lead
        )
      );
      
      toast.success('Estado del lead actualizado correctamente');
    } catch (err) {
      console.error('Error al actualizar estado del lead:', err);
      toast.error('Error al actualizar el estado del lead');
      
      // Actualizar solo localmente si la API falla
      setLeads(prevLeads => 
        prevLeads.map(lead => 
          lead.id === leadId ? { ...lead, estado: newStatus } : lead
        )
      );
    }
  };

  // Añadir nuevo lead
  const addLead = async (lead: Lead) => {
    try {
      // Transform lead to match the format expected by createLead
      const leadData = {
        nombre: lead.nombre,
        email: lead.email || '',
        telefono: lead.telefono || '',
        empresa: lead.empresa,
        estado: lead.estado,
        fecha_creacion: lead.fechaCreacion,
        fuente: 'Form',
        tienevehiculo: lead.tieneVehiculo || 'NO',
        experienciaseguridad: lead.experienciaSeguridad || 'NO',
        esmilitar: lead.esMilitar || 'NO',
        credencialsedena: 'NO',
        esarmado: 'NO',
        valor: 0
      };
      
      await leadService.createLead(leadData);
      
      // Actualizar lista local
      setLeads(prevLeads => [lead, ...prevLeads]);
      
      toast.success('Lead registrado correctamente');
    } catch (err) {
      console.error('Error al crear lead en Supabase:', err);
      toast.error('Error al crear lead en la base de datos');
      
      // Añadir solo localmente si la API falla
      setLeads(prevLeads => [lead, ...prevLeads]);
    }
  };

  // Eliminar lead
  const deleteLead = async (leadId: number) => {
    try {
      await leadService.deleteLead(leadId);
      
      // Actualizar lista local
      setLeads(prevLeads => prevLeads.filter(lead => lead.id !== leadId));
      
      toast.success('Lead eliminado correctamente');
    } catch (err) {
      console.error('Error al eliminar lead:', err);
      toast.error('Error al eliminar el lead');
      
      // Eliminar solo localmente si la API falla
      setLeads(prevLeads => prevLeads.filter(lead => lead.id !== leadId));
    }
  };

  // Actualizar efecto para guardar en localStorage como respaldo
  useEffect(() => {
    if (leads.length > 0) {
      localStorage.setItem('leads', JSON.stringify(leads));
    }
  }, [leads]);

  return (
    <LeadsContext.Provider value={{ 
      leads, 
      setLeads, 
      updateLeadStatus, 
      addLead,
      deleteLead,
      loading,
      error,
      refetchLeads: fetchLeads
    }}>
      {children}
    </LeadsContext.Provider>
  );
};
