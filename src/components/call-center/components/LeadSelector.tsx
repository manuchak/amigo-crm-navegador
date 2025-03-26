
import React from 'react';
import { User, PhoneCall, Calendar } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface LeadSelectorProps {
  leads: { id: number; nombre: string; empresa: string; contacto: string; estado: string; fechaCreacion: string }[];
  selectedLead: number | null;
  setSelectedLead: (id: number | null) => void;
  isCallActive: boolean;
}

const LeadSelector: React.FC<LeadSelectorProps> = ({
  leads,
  selectedLead,
  setSelectedLead,
  isCallActive
}) => {
  const lead = leads.find(l => l.id === selectedLead);

  return (
    <div className="space-y-4">
      <Label htmlFor="lead-selector">Seleccionar Lead</Label>
      <Select 
        value={selectedLead?.toString() || ""} 
        onValueChange={(value) => setSelectedLead(Number(value))}
        disabled={isCallActive}
      >
        <SelectTrigger id="lead-selector">
          <SelectValue placeholder="Seleccionar lead para llamar" />
        </SelectTrigger>
        <SelectContent>
          {leads.map(lead => (
            <SelectItem key={lead.id} value={lead.id.toString()}>
              {lead.nombre} - {lead.empresa}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {selectedLead && lead && (
        <div className="mt-4 bg-secondary/50 p-4 rounded-md">
          <div className="flex items-center gap-3 mb-2">
            <User className="h-5 w-5 text-muted-foreground" />
            <span>{lead.nombre}</span>
          </div>
          <div className="flex items-center gap-3 mb-2">
            <PhoneCall className="h-5 w-5 text-muted-foreground" />
            <span>{lead.contacto}</span>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <span>{lead.fechaCreacion}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadSelector;
