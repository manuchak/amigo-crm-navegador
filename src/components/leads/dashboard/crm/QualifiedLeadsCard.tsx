
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { supabase } from '@/integrations/supabase/client';

const QualifiedLeadsCard = () => {
  const [qualifiedCount, setQualifiedCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchQualifiedLeads = async () => {
      setLoading(true);
      try {
        // Query for qualified and validated leads count
        const { count, error } = await supabase
          .from('leads')
          .select('id', { count: 'exact', head: true })
          .in('estado', ['Calificado', 'Validado']);
          
        if (error) {
          console.error('Error fetching qualified leads:', error);
          return;
        }
        
        setQualifiedCount(count || 0);
      } catch (error) {
        console.error('Error in fetching qualified leads:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQualifiedLeads();
  }, []);

  return (
    <Card className="shadow-sm h-full">
      <CardContent className="p-4 flex flex-col justify-between h-full">
        <div className="flex justify-between items-start">
          <div className="mb-2 font-semibold text-blue-600">Calificados</div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="cursor-help">
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs bg-white p-3 text-sm shadow-lg rounded-lg border">
                <p>Número de custodios calificados y validados pendientes de aprobación</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div>
          <div className="text-4xl font-bold mb-1">
            {loading ? (
              <span className="animate-pulse">...</span>
            ) : (
              qualifiedCount
            )}
          </div>
          <div className="text-xs text-muted-foreground">
            Custodios pendientes de revisión
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QualifiedLeadsCard;
