
import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LeadFilterSectionProps } from "./types";

const estadosLead = ["Nuevo", "Contactado", "En progreso", "Calificado", "No calificado"];
const carTypes = ["Hatchback", "Sedán", "SUV", "Pickup"];
const credencialOptions = [
  { value: "yes", label: "Sí" },
  { value: "no", label: "No" }
];

const LeadFilterSection: React.FC<LeadFilterSectionProps> = ({
  carMinYear,
  carMaxYear,
  selectedState,
  setSelectedState,
  extraFilters,
  setExtraFilters
}) => {
  return (
    <>
      <div className="mb-4">
        <Label className="text-sm font-medium mb-1 block">Estado del custodio</Label>
        <Select value={selectedState} onValueChange={setSelectedState}>
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar estado" />
          </SelectTrigger>
          <SelectContent>
            {estadosLead.map(estado => (
              <SelectItem key={estado} value={estado}>
                {estado}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <Label className="text-sm font-medium mb-1 block">Credencial SEDENA</Label>
          <Select
            value={extraFilters.hasSedenaId}
            onValueChange={(value) => setExtraFilters({ ...extraFilters, hasSedenaId: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent>
              {credencialOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label className="text-sm font-medium mb-1 block">Tipo de vehículo</Label>
          <Select
            value={extraFilters.carType}
            onValueChange={(value) => setExtraFilters({ ...extraFilters, carType: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent>
              {carTypes.map(type => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <Label className="text-sm font-medium mb-1 block">Año mín. vehículo</Label>
          <Select
            value={extraFilters.fromYear?.toString()}
            onValueChange={(value) => setExtraFilters({ 
              ...extraFilters, 
              fromYear: parseInt(value, 10)
            })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Desde año" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: carMaxYear - carMinYear + 1 }, (_, i) => carMinYear + i).map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label className="text-sm font-medium mb-1 block">Año máx. vehículo</Label>
          <Select
            value={extraFilters.toYear?.toString()}
            onValueChange={(value) => setExtraFilters({ 
              ...extraFilters, 
              toYear: parseInt(value, 10)
            })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Hasta año" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: carMaxYear - carMinYear + 1 }, (_, i) => carMinYear + i).map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </>
  );
};

export default LeadFilterSection;
