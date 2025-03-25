
import React from 'react';
import { Phone, PhoneCall, PhoneOff, User, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface CallControlPanelProps {
  leads: { id: number; nombre: string; empresa: string; contacto: string; estado: string; fechaCreacion: string }[];
  selectedLead: number | null;
  setSelectedLead: (id: number | null) => void;
  isCallActive: boolean;
  callResult: string;
  setCallResult: (result: string) => void;
  notes: string;
  setNotes: (notes: string) => void;
  handleStartCall: () => Promise<void>;
  handleEndCall: () => void;
}

const CallControlPanel: React.FC<CallControlPanelProps> = ({
  leads,
  selectedLead,
  setSelectedLead,
  isCallActive,
  callResult,
  setCallResult,
  notes,
  setNotes,
  handleStartCall,
  handleEndCall
}) => {
  const lead = leads.find(l => l.id === selectedLead);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-xl">Control de Llamadas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Selección de Lead */}
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
            
            <div className="flex mt-4 space-x-3">
              {!isCallActive ? (
                <Button onClick={handleStartCall} disabled={!selectedLead} className="bg-green-500 hover:bg-green-600">
                  <Phone className="mr-2 h-4 w-4" />
                  Iniciar Llamada
                </Button>
              ) : (
                <Button onClick={handleEndCall} variant="destructive">
                  <PhoneOff className="mr-2 h-4 w-4" />
                  Finalizar Llamada
                </Button>
              )}
            </div>
          </div>
          
          {/* Resultado de la llamada */}
          <div className="space-y-4">
            <Label>Resultado de la llamada</Label>
            <RadioGroup 
              disabled={!isCallActive}
              value={callResult} 
              onValueChange={setCallResult}
              className="grid grid-cols-1 gap-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Contactado" id="contactado" />
                <Label htmlFor="contactado" className="cursor-pointer">Contactado</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="No contestó" id="no-contesto" />
                <Label htmlFor="no-contesto" className="cursor-pointer">No contestó</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Buzón de voz" id="buzon" />
                <Label htmlFor="buzon" className="cursor-pointer">Buzón de voz</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Número equivocado" id="equivocado" />
                <Label htmlFor="equivocado" className="cursor-pointer">Número equivocado</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Programada" id="programada" />
                <Label htmlFor="programada" className="cursor-pointer">Programada</Label>
              </div>
            </RadioGroup>
            
            <div className="mt-4">
              <Label htmlFor="call-notes">Notas</Label>
              <Input
                id="call-notes"
                placeholder="Agregar notas sobre la llamada"
                disabled={!isCallActive}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CallControlPanel;
