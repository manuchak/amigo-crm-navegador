
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ContactedLeadsContextType {
  contactedCount: number;
  loading: boolean;
  percentage: number;
}

const ContactedLeadsContext = createContext<ContactedLeadsContextType>({
  contactedCount: 0,
  loading: true,
  percentage: 0
});

export const useContactedLeads = () => useContext(ContactedLeadsContext);

export const ContactedLeadsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [contactedCount, setContactedCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [percentage, setPercentage] = useState<number>(0);

  useEffect(() => {
    const fetchContactedLeads = async () => {
      setLoading(true);
      try {
        // Query for leads with the specific ended_reason
        // Using a different approach to get distinct customer numbers
        const { data, error } = await supabase
          .from('vapi_call_logs')
          .select('customer_number')
          .eq('ended_reason', 'assistant-ended-call-with-hangup-task');
          
        if (error) {
          console.error('Error fetching contacted leads:', error);
          return;
        }
        
        // Get unique customer numbers
        const uniqueNumbers = new Set(data.map(log => log.customer_number));
        const distinctCount = uniqueNumbers.size;
        
        setContactedCount(distinctCount || 0);
        
        // Get total count for percentage calculation
        const { count: totalCount, error: totalError } = await supabase
          .from('leads')
          .select('id', { count: 'exact', head: true });
          
        if (totalError) {
          console.error('Error fetching total leads:', totalError);
          return;
        }
        
        // Calculate percentage
        const calculatedPercentage = totalCount ? ((distinctCount || 0) / totalCount) * 100 : 0;
        setPercentage(Math.round(calculatedPercentage * 10) / 10); // Round to 1 decimal place
        
      } catch (error) {
        console.error('Error in fetching contacted leads:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContactedLeads();
  }, []);

  return (
    <ContactedLeadsContext.Provider value={{ contactedCount, loading, percentage }}>
      {children}
    </ContactedLeadsContext.Provider>
  );
};
