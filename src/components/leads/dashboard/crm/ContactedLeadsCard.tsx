
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { supabase } from '@/integrations/supabase/client';

const ContactedLeadsCard = () => {
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
    <Card className="shadow-sm h-full">
      <CardContent className="p-4 flex flex-col justify-between h-full">
        <div className="flex justify-between items-start">
          <div className="mb-2 font-semibold text-amber-600">Contactados</div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="cursor-help">
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs bg-white p-3 text-sm shadow-lg rounded-lg border">
                <p>Leads que han sido contactados exitosamente por el asistente de llamadas automático.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div>
          <div className="text-4xl font-bold mb-1">
            {loading ? (
              <span className="animate-pulse">...</span>
            ) : (
              contactedCount
            )}
          </div>
          <div className="flex items-center gap-1 text-xs">
            <span className={percentage > 0 ? "text-green-500" : "text-red-500"}>
              {percentage}% avance
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContactedLeadsCard;
