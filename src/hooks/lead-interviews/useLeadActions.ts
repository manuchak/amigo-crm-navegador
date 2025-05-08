
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { LeadForInterview } from './types';
import { useAuth } from '@/context/auth/AuthContext';

export const useLeadActions = (leads: LeadForInterview[], setLeads: React.Dispatch<React.SetStateAction<LeadForInterview[]>>, fetchLeads: () => Promise<void>) => {
  const { currentUser } = useAuth();

  const updateLeadStatus = async (leadId: number, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ estado: newStatus })
        .eq('id', leadId);

      if (error) throw error;
      
      // Update local state
      setLeads(leads.map(lead => 
        lead.id === leadId ? { ...lead, estado: newStatus } : lead
      ));
      
      toast.success('Estado actualizado correctamente');
    } catch (error) {
      console.error('Error updating lead status:', error);
      toast.error('Error al actualizar el estado');
    }
  };

  const classifyLead = async (leadId: number, type: 'armed' | 'vehicle') => {
    try {
      const updates: any = {
        estado: 'Clasificado',
      };
      
      if (type === 'armed') {
        updates.esarmado = 'SI';
        updates.empresa = 'Custodio (armado)';
      } else if (type === 'vehicle') {
        updates.tienevehiculo = 'SI';
        updates.empresa = 'Custodio (con vehículo)';
      }
      
      const { error } = await supabase
        .from('leads')
        .update(updates)
        .eq('id', leadId);

      if (error) throw error;
      
      // Update local state
      setLeads(leads.map(lead => 
        lead.id === leadId ? { ...lead, ...updates } : lead
      ));
      
      toast.success(`Candidato clasificado como Custodio ${type === 'armed' ? 'Armado' : 'con Vehículo'}`);
    } catch (error) {
      console.error('Error classifying lead:', error);
      toast.error('Error al clasificar el candidato');
    }
  };

  const assignLead = async (leadId: number, userId: string) => {
    if (!currentUser) return;
    
    try {
      // Update the lead with assigned_to and assigned_at
      const { error: leadError } = await supabase
        .from('leads')
        .update({ 
          assigned_to: userId, 
          assigned_at: new Date().toISOString() 
        })
        .eq('id', leadId);

      if (leadError) throw leadError;
      
      // Create a record in lead_assignments table
      const { error: assignmentError } = await supabase
        .from('lead_assignments')
        .insert({
          lead_id: leadId,
          assigned_to: userId,
          assigned_by: currentUser.uid,
          status: 'pending'
        });

      if (assignmentError) throw assignmentError;
      
      toast.success('Asignado correctamente');
      
      // Refresh data to ensure consistency
      fetchLeads();
    } catch (error) {
      console.error('Error assigning lead:', error);
      toast.error('Error al asignar el candidato');
    }
  };

  const unassignLead = async (leadId: number) => {
    if (!currentUser) return;
    
    try {
      // Remove assignment from lead
      const { error: leadError } = await supabase
        .from('leads')
        .update({ 
          assigned_to: null, 
          assigned_at: null 
        })
        .eq('id', leadId);

      if (leadError) throw leadError;
      
      // Set assignment status to 'cancelled'
      const { error: assignmentError } = await supabase
        .from('lead_assignments')
        .update({ status: 'cancelled' })
        .eq('lead_id', leadId)
        .eq('status', 'pending');

      if (assignmentError) throw assignmentError;
      
      toast.success('Asignación removida');
      
      // Refresh data
      fetchLeads();
    } catch (error) {
      console.error('Error unassigning lead:', error);
      toast.error('Error al remover la asignación');
    }
  };

  return {
    updateLeadStatus,
    classifyLead,
    assignLead,
    unassignLead
  };
};
