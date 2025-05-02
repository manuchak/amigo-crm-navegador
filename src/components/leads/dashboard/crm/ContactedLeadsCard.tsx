
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useContactedLeads } from './ContactedLeadsContext';

const ContactedLeadsCard = () => {
  const { contactedCount, loading, percentage } = useContactedLeads();

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
