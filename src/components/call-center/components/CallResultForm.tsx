
import React from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface CallResultFormProps {
  isCallActive: boolean;
  callResult: string;
  setCallResult: (result: string) => void;
  notes: string;
  setNotes: (notes: string) => void;
}

const CallResultForm: React.FC<CallResultFormProps> = ({
  isCallActive,
  callResult,
  setCallResult,
  notes,
  setNotes
}) => {
  return (
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
  );
};

export default CallResultForm;
