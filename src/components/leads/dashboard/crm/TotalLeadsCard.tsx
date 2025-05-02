
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { supabase } from '@/integrations/supabase/client';

const TotalLeadsCard = () => {
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchTotalLeads = async () => {
      setLoading(true);
      try {
        // Query for total leads count
        const { count, error } = await supabase
          .from('leads')
          .select('id', { count: 'exact', head: true });
          
        if (error) {
          console.error('Error fetching total leads:', error);
          return;
        }
        
        setTotalCount(count || 0);
      } catch (error) {
        console.error('Error in fetching total leads:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTotalLeads();
  }, []);

  return (
    <Card className="shadow-sm h-full">
      <CardContent className="p-4 flex flex-col justify-between h-full">
        <div className="flex justify-between items-start">
          <div className="mb-2 font-semibold text-blue-600">Total de Leads</div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="cursor-help">
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs bg-white p-3 text-sm shadow-lg rounded-lg border">
                <p>Número total de leads registrados en el sistema.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div>
          <div className="text-4xl font-bold mb-1">
            {loading ? (
              <span className="animate-pulse">...</span>
            ) : (
              totalCount
            )}
          </div>
          <div className="text-xs text-muted-foreground">
            Base de datos completa
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TotalLeadsCard;
