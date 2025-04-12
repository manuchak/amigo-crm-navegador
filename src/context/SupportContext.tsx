
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

export type Ticket = {
  id: string;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'pending' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  ticket_number: string;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  customer_id: string | null;
  customer_email: string;
  customer_name: string;
  assigned_to: string | null;
  resolution_time_seconds: number | null;
  channel: string;
};

export type TicketComment = {
  id: string;
  ticket_id: string;
  content: string;
  created_at: string;
  author_name: string;
  author_email: string;
  is_internal: boolean;
  user_id: string | null;
};

export type TicketMetrics = {
  total: number;
  open: number;
  resolved: number;
  avgResolutionTime: number;
  satisfactionScore: number;
  responseTime: number;
};

interface SupportContextProps {
  tickets: Ticket[];
  ticketMetrics: TicketMetrics;
  isLoadingTickets: boolean;
  refreshTickets: () => void;
  createTicket: (ticket: Partial<Ticket> & { description: string; subject: string }) => Promise<Ticket | null>;
  updateTicket: (id: string, updates: Partial<Ticket>) => Promise<boolean>;
  getTicketComments: (ticketId: string) => Promise<TicketComment[]>;
  addComment: (ticketId: string, content: string, isInternal: boolean) => Promise<TicketComment | null>;
  searchTickets: (query: string) => Promise<Ticket[]>;
}

const SupportContext = createContext<SupportContextProps | undefined>(undefined);

export const SupportProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [ticketMetrics, setTicketMetrics] = useState<TicketMetrics>({
    total: 0,
    open: 0,
    resolved: 0,
    avgResolutionTime: 0,
    satisfactionScore: 0,
    responseTime: 0,
  });

  const { 
    data: tickets = [], 
    isLoading: isLoadingTickets,
    refetch: refreshTickets 
  } = useQuery({
    queryKey: ['supportTickets', currentUser?.uid],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching tickets:', error);
        toast.error('No se pudieron cargar los tickets');
        return [];
      }
      
      return data as Ticket[];
    },
    enabled: !!currentUser,
  });

  useEffect(() => {
    if (tickets.length > 0) {
      // Calculate metrics
      const open = tickets.filter(t => t.status === 'open' || t.status === 'in_progress').length;
      const resolved = tickets.filter(t => t.status === 'resolved').length;
      
      // Calculate average resolution time (for resolved tickets only)
      const resolvedTickets = tickets.filter(t => t.resolution_time_seconds);
      const avgResolutionTime = resolvedTickets.length > 0
        ? resolvedTickets.reduce((sum, t) => sum + (t.resolution_time_seconds || 0), 0) / resolvedTickets.length
        : 0;
      
      setTicketMetrics({
        total: tickets.length,
        open,
        resolved,
        avgResolutionTime,
        satisfactionScore: 4.2, // Placeholder - would come from actual satisfaction ratings
        responseTime: 24, // Placeholder - would come from first response time tracking
      });
    }
  }, [tickets]);
  
  const createTicket = async (ticket: Partial<Ticket> & { description: string; subject: string }): Promise<Ticket | null> => {
    if (!currentUser) {
      toast.error('Debe iniciar sesión para crear un ticket');
      return null;
    }
    
    try {
      // Generate a ticket number based on current year and a random 6-digit number
      // In production, this would be handled by a database trigger or sequence
      const year = new Date().getFullYear();
      const randomNum = Math.floor(100000 + Math.random() * 900000); // 6-digit number
      const ticketNumber = `${year}-${randomNum}`;
      
      const newTicket = {
        ...ticket,
        ticket_number: ticketNumber, // Add the required ticket_number field
        status: 'open' as const,     // Ensure status is set
        customer_id: currentUser.uid || null,
        customer_email: ticket.customer_email || currentUser.email || '',
        customer_name: ticket.customer_name || currentUser.displayName || '',
      };
      
      const { data, error } = await supabase
        .from('support_tickets')
        .insert(newTicket)
        .select()
        .single();
        
      if (error) {
        console.error('Error creating ticket:', error);
        toast.error('No se pudo crear el ticket');
        return null;
      }
      
      toast.success('Ticket creado exitosamente');
      refreshTickets();
      return data as Ticket;
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast.error('No se pudo crear el ticket');
      return null;
    }
  };
  
  const updateTicket = async (id: string, updates: Partial<Ticket>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update(updates)
        .eq('id', id);
        
      if (error) {
        console.error('Error updating ticket:', error);
        toast.error('No se pudo actualizar el ticket');
        return false;
      }
      
      toast.success('Ticket actualizado exitosamente');
      refreshTickets();
      return true;
    } catch (error) {
      console.error('Error updating ticket:', error);
      toast.error('No se pudo actualizar el ticket');
      return false;
    }
  };
  
  const getTicketComments = async (ticketId: string): Promise<TicketComment[]> => {
    try {
      const { data, error } = await supabase
        .from('ticket_comments')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });
        
      if (error) {
        console.error('Error fetching comments:', error);
        return [];
      }
      
      return data as TicketComment[];
    } catch (error) {
      console.error('Error fetching comments:', error);
      return [];
    }
  };
  
  const addComment = async (ticketId: string, content: string, isInternal: boolean): Promise<TicketComment | null> => {
    if (!currentUser) {
      toast.error('Debe iniciar sesión para agregar un comentario');
      return null;
    }
    
    try {
      const comment = {
        ticket_id: ticketId,
        content,
        is_internal: isInternal,
        user_id: currentUser.uid || null,
        author_name: currentUser.displayName || 'Usuario',
        author_email: currentUser.email || '',
      };
      
      const { data, error } = await supabase
        .from('ticket_comments')
        .insert(comment)
        .select()
        .single();
        
      if (error) {
        console.error('Error adding comment:', error);
        toast.error('No se pudo agregar el comentario');
        return null;
      }
      
      // Update ticket's updated_at timestamp
      await supabase
        .from('support_tickets')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', ticketId);
      
      return data as TicketComment;
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('No se pudo agregar el comentario');
      return null;
    }
  };
  
  const searchTickets = async (query: string): Promise<Ticket[]> => {
    if (!query.trim()) return tickets;
    
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .or(`subject.ilike.%${query}%,description.ilike.%${query}%,ticket_number.ilike.%${query}%`)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error searching tickets:', error);
        return [];
      }
      
      return data as Ticket[];
    } catch (error) {
      console.error('Error searching tickets:', error);
      return [];
    }
  };

  return (
    <SupportContext.Provider
      value={{
        tickets,
        ticketMetrics,
        isLoadingTickets,
        refreshTickets,
        createTicket,
        updateTicket,
        getTicketComments,
        addComment,
        searchTickets,
      }}
    >
      {children}
    </SupportContext.Provider>
  );
};

export const useSupport = () => {
  const context = useContext(SupportContext);
  if (context === undefined) {
    throw new Error('useSupport must be used within a SupportProvider');
  }
  return context;
};
