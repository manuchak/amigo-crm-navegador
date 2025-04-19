
import React from "react";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

// Should match estadosLead
const estados = ["Nuevo", "Contactado", "En progreso", "Calificado", "No calificado"];

interface LeadStatusSelectProps {
  value: string;
  onChange: (val: string) => void;
}

const LeadStatusSelect: React.FC<LeadStatusSelectProps> = ({ value, onChange }) => (
  <Select value={value} onValueChange={onChange}>
    <SelectTrigger aria-label="Filtrar por estado">
      <SelectValue placeholder="Selecciona estado del custodio" />
    </SelectTrigger>
    <SelectContent className="bg-white z-[101]">
      {estados.map(estado => (
        <SelectItem key={estado} value={estado}>
          {estado}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
);

export default LeadStatusSelect;
