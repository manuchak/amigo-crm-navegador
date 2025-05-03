
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLeads } from '@/context/LeadsContext';
import { supabase } from '@/integrations/supabase/client';

interface ContactedLeadsContextType {
  contactedCount: number;
  loading: boolean;
  percentage: number;
  error: string | null;
}

const ContactedLeadsContext = createContext<ContactedLeadsContextType>({
  contactedCount: 0,
  loading: true,
  percentage: 0,
  error: null
});

export const useContactedLeads = () => useContext(ContactedLeadsContext);

export const ContactedLeadsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [contactedCount, setContactedCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [percentage, setPercentage] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const { leads } = useLeads();

  useEffect(() => {
    const fetchContactedLeads = async () => {
      setLoading(true);
      try {
        // Query for contacted leads count
        const { count, error } = await supabase
          .from('leads')
          .select('id', { count: 'exact', head: true })
          .eq('estado', 'Contactado');
          
        if (error) {
          console.error('Error fetching contacted leads:', error);
          setError(error.message);
          return;
        }
        
        setContactedCount(count || 0);
        
        // Calculate percentage based on total leads
        const totalLeads = leads.length;
        if (totalLeads > 0) {
          const percentageValue = ((count || 0) / totalLeads) * 100;
          setPercentage(Math.round(percentageValue * 10) / 10); // Round to 1 decimal place
        } else {
          setPercentage(0);
        }
      } catch (error) {
        console.error('Error in fetching contacted leads:', error);
        setError('Error fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchContactedLeads();
  }, [leads]);

  return (
    <ContactedLeadsContext.Provider value={{ contactedCount, loading, percentage, error }}>
      {children}
    </ContactedLeadsContext.Provider>
  );
};
