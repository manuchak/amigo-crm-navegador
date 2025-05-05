
import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LeadFilterSectionProps } from "./types";

const estadosLead = ["Nuevo", "Contactado", "En progreso", "Calificado", "No calificado"];
const carTypes = ["Hatchback", "Sedán", "SUV", "Pickup"];

const LeadFilterSection: React.FC<LeadFilterSectionProps> = ({
  carMinYear,
  carMaxYear,
  selectedState,
  setSelectedState,
  extraFilters,
  setExtraFilters
}) => {
  return (
    <div className="space-y-4 py-2 my-2">
      <div className="space-y-2">
        <Label htmlFor="estado">Estado del lead</Label>
        <Select
          value={selectedState}
          onValueChange={setSelectedState}
        >
          <SelectTrigger id="estado" className="w-full">
            <SelectValue placeholder="Selecciona un estado" />
          </SelectTrigger>
          <SelectContent>
            {estadosLead.map((estado) => (
              <SelectItem key={estado} value={estado}>{estado}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="modelo">Tipo de vehículo</Label>
        <Select
          value={extraFilters.carType || ""}
          onValueChange={(value) =>
            setExtraFilters({ ...extraFilters, carType: value || undefined })
          }
        >
          <SelectTrigger id="modelo" className="w-full">
            <SelectValue placeholder="Todos los tipos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos los tipos</SelectItem>
            {carTypes.map((type) => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="year-range">Año del vehículo</Label>
        <Select
          value={
            extraFilters.fromYear && extraFilters.toYear
              ? `${extraFilters.fromYear}-${extraFilters.toYear}`
              : ""
          }
          onValueChange={(value) => {
            if (value === "") {
              setExtraFilters({
                ...extraFilters,
                fromYear: undefined,
                toYear: undefined,
              });
            } else {
              const [from, to] = value.split("-").map(Number);
              setExtraFilters({
                ...extraFilters,
                fromYear: from,
                toYear: to,
              });
            }
          }}
        >
          <SelectTrigger id="year-range" className="w-full">
            <SelectValue placeholder="Cualquier año" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Cualquier año</SelectItem>
            <SelectItem value={`${carMinYear}-${carMaxYear}`}>
              {carMinYear} - {carMaxYear}
            </SelectItem>
            <SelectItem value={`${carMinYear + 5}-${carMaxYear}`}>
              {carMinYear + 5} - {carMaxYear}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="credencial">Credencial SEDENA</Label>
        <Select
          value={extraFilters.hasSedenaId || ""}
          onValueChange={(value) =>
            setExtraFilters({ ...extraFilters, hasSedenaId: value || undefined })
          }
        >
          <SelectTrigger id="credencial" className="w-full">
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos</SelectItem>
            <SelectItem value="yes">Con credencial</SelectItem>
            <SelectItem value="no">Sin credencial</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default LeadFilterSection;
