
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PhoneCall, ClipboardList, Phone, Mail, Calendar } from 'lucide-react';
import { Lead } from '@/context/LeadsContext';
import LeadStatusBadge from './LeadStatusBadge';
import LeadCallCount from './LeadCallCount';
import { cn } from '@/lib/utils';

interface LeadCardProps {
  lead: Lead;
  onCall: (lead: Lead) => void;
  onViewCallLogs: (leadId: number) => void;
}

const LeadCard: React.FC<LeadCardProps> = ({ lead, onCall, onViewCallLogs }) => {
  // Define card border color based on lead status
  const cardBorderClass = {
    "Nuevo": "border-l-4 border-l-blue-500",
    "Contactado": "border-l-4 border-l-amber-500",
    "Contacto Llamado": "border-l-4 border-l-amber-500",
    "Calificado": "border-l-4 border-l-green-500",
    "Rechazado": "border-l-4 border-l-red-500",
  }[lead.estado] || "";
  
  return (
    <Card className={cn("shadow-sm hover:shadow transition-all", cardBorderClass)}>
      <CardContent className="pt-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium truncate" title={lead.nombre}>{lead.nombre}</h3>
          <LeadStatusBadge status={lead.estado} />
        </div>
        
        <div className="text-sm text-slate-600 mb-1">
          {lead.empresa}
        </div>
        
        <div className="space-y-2 mt-4 text-sm">
          {lead.telefono && (
            <div className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5 text-slate-400" />
              <span>{lead.telefono}</span>
            </div>
          )}
          
          {lead.email && (
            <div className="flex items-center gap-2">
              <Mail className="h-3.5 w-3.5 text-slate-400" />
              <span className="truncate" title={lead.email}>{lead.email}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            <span>{lead.fechaCreacion}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Llamadas:</span>
            <LeadCallCount callCount={lead.callCount} />
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="border-t pt-3 flex gap-2">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => onCall(lead)}
          className="flex-1 text-slate-700 hover:text-primary"
        >
          <PhoneCall className="h-4 w-4 mr-1" />
          Llamar
        </Button>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => onViewCallLogs(lead.id)}
          className="flex-1 text-slate-700 hover:text-primary"
        >
          <ClipboardList className="h-4 w-4 mr-1" />
          Detalles
        </Button>
      </CardFooter>
    </Card>
  );
};

export default LeadCard;
