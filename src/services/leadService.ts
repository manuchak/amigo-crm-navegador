import { supabase } from '@/integrations/supabase/client';

export const fetchLeads = async () => {
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('*');
    
    if (error) {
      console.error('Error fetching leads:', error);
      throw error;
    }
    
    console.info('Leads data from Supabase:', data);
    return data || [];
  } catch (error) {
    console.error('Error in fetchLeads:', error);
    throw error;
  }
};

export const updateLeadStatus = async (id: string, estado: string) => {
  try {
    const { error } = await supabase
      .from('leads')
      .update({ estado })
      .eq('id', id);

    if (error) {
      console.error('Error updating lead status:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in updateLeadStatus:', error);
    throw error;
  }
};
